import { db } from "@neuralpay/db";
import {
  budgets,
  transactions,
  type TransactionRecord,
} from "@neuralpay/db/schema";
import {
  type CategoryTotal,
  type ListTransactionsInput,
  type OverviewTotal,
  type PaginatedResult,
  type ServiceResult,
} from "@neuralpay/types";
import { endOfMonth, startOfDay, startOfMonth, subMonths } from "date-fns";
import { and, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";

export const TransactionsService = {
  async list(
    userId: string,
    input: ListTransactionsInput,
  ): Promise<ServiceResult<PaginatedResult<TransactionRecord>>> {
    try {
      const conditions = [eq(transactions.userId, userId)];

      // ── Filters
      if (input.bankAccountId) {
        conditions.push(eq(transactions.bankAccountId, input.bankAccountId));
      }
      if (input.category) {
        conditions.push(eq(transactions.category, input.category as any));
      }
      if (input.type) {
        conditions.push(eq(transactions.type, input.type));
      }
      if (input.isAnomaly !== undefined) {
        conditions.push(eq(transactions.isAnomaly, input.isAnomaly));
      }
      if (input.search) {
        conditions.push(ilike(transactions.description, `%${input.search}%`));
      }
      if (input.dateFrom) {
        conditions.push(gte(transactions.date, new Date(input.dateFrom)));
      }
      if (input.dateTo) {
        conditions.push(lte(transactions.date, new Date(input.dateTo)));
      }

      // ── TOTAL (no cursor)
      const data = await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .limit(input.limit);

      const hasMore = data.length > input.limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? lastItem?.id : null;

      return {
        success: true,
        data: {
          items,
          nextCursor: nextCursor!,
        },
      };
    } catch (err) {
      console.error("[TransactionsService.list]", err);
      return {
        success: false,
        error: "Failed to fetch transactions",
        code: "DB_ERROR",
      };
    }
  },

  async getById(
    id: string,
    userId: string,
  ): Promise<ServiceResult<TransactionRecord>> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .limit(1);

      if (!result[0]) {
        return {
          success: false,
          error: "Transaction not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: result[0] };
    } catch (err) {
      console.error("[TransactionsService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch transaction",
        code: "DB_ERROR",
      };
    }
  },

  // ─── SPENDING OVERVIEW WITH BUDGET COMPARISON ─────────────────────────────
  async getSpendingOverview(
    userId: string,
    input: {
      period?: "7d" | "30d" | "90d" | "custom";
      from?: string;
      to?: string;
    },
  ): Promise<ServiceResult<OverviewTotal>> {
    try {
      const { period = "30d", from, to } = input;

      let startDate: Date;
      const endDate = new Date();

      if (period === "7d") {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "30d") {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      } else if (period === "90d") {
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      } else if (from && to) {
        startDate = new Date(from);
        endDate.setTime(new Date(to).getTime());
      } else {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // 1. Category Spending (for Pie Chart)
      const categoryResult = await db
        .select({
          category: transactions.category,
          total: sql<number>`sum(${transactions.amount}::numeric)::float`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .groupBy(transactions.category)
        .orderBy(desc(sql`sum(${transactions.amount}::numeric)`));

      const categorySpending = categoryResult.map((r) => ({
        category: r.category ?? "other",
        total: Number(r.total) || 0,
      }));

      // 2. Trend Data with DAILY granularity (for Bar / Area charts)
      const trendResult = await db
        .select({
          date: transactions.date,
          name: sql<string>`to_char(${transactions.date}, 'Mon DD')`,
          value: sql<number>`sum(${transactions.amount}::numeric)::float`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .groupBy(
          sql`to_char(${transactions.date}, 'Mon DD')`,
          transactions.date,
        )
        .orderBy(transactions.date);

      // 3. Fetch budgets for the period
      const now = new Date();
      const budgetResult = await db
        .select({
          category: budgets.category,
          limitAmount: sql<number>`${budgets.limitAmount}::numeric`,
        })
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.month, now.getMonth() + 1),
            eq(budgets.year, now.getFullYear()),
          ),
        );

      // Calculate total monthly budget and daily allocation
      const totalBudget = budgetResult.reduce(
        (sum, b) => sum + Number(b.limitAmount),
        0,
      );
      const daysInPeriod = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const dailyBudget = totalBudget / 30; // Budget is monthly, spread per day

      // Build category budget map
      const categoryBudgetMap = new Map(
        budgetResult.map((b) => [b.category, Number(b.limitAmount)]),
      );

      // 4. Build trend data with spending + budget
      const trendData = trendResult.map((t) => {
        const dayOfMonth = new Date(t.date).getDate();
        const daysInMonth = endOfMonth(new Date(t.date)).getDate();
        const budgetProgress = (dailyBudget * dayOfMonth) / (daysInMonth / 30);

        return {
          name: t.name,
          value: Number(t.value) || 0,
          budget: Number(budgetProgress.toFixed(2)),
          dailyBudget: Number(dailyBudget.toFixed(2)),
        };
      });

      // 5. Category spending vs budget (for pie chart comparison)
      const categorySpendingWithBudget = categorySpending.map((item) => ({
        ...item,
        budget: categoryBudgetMap.get(item.category) || 0,
      }));

      const totalSpending = categorySpending.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      return {
        success: true,
        data: {
          totalSpending,
          totalBudget,
          categorySpending: categorySpendingWithBudget,
          trendData,
        },
      };
    } catch (err) {
      console.error("[TransactionsService.getSpendingOverview]", err);
      return {
        success: false,
        error: "Failed to fetch spending overview",
        code: "DB_ERROR",
      };
    }
  },

  // Groups spending by category for the current month
  async getSpendingByCategory(
    userId: string,
    month: number,
    year: number,
  ): Promise<ServiceResult<CategoryTotal[]>> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const result = await db
        .select({
          category: transactions.category,
          total: sql<number>`sum(${transactions.amount}::numeric)::float`,
          count: sql<number>`count(*)::int`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .groupBy(transactions.category)
        .orderBy(desc(sql`sum(${transactions.amount}::numeric)`));

      return {
        success: true,
        data: result.map((r) => ({
          category: r.category ?? "other",
          total: r.total,
          count: r.count,
        })),
      };
    } catch (err) {
      console.error("[TransactionsService.getSpendingByCategory]", err);
      return {
        success: false,
        error: "Failed to aggregate spending",
        code: "DB_ERROR",
      };
    }
  },

  // Month-over-month spending totals
  async getMonthlySpending(
    userId: string,
  ): Promise<ServiceResult<{ month: string; total: number }[]>> {
    const now = new Date();
    try {
      const result = await db
        .select({
          month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
          total: sql<number>`sum(${transactions.amount}::numeric)::float`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, startOfDay(subMonths(now, 5))),
          ),
        )
        .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);

      return { success: true, data: result };
    } catch (err) {
      console.error("[TransactionsService.getMonthlySpending]", err);
      return {
        success: false,
        error: "Failed to fetch monthly spending",
        code: "DB_ERROR",
      };
    }
  },

  // Current month spending total
  async getCurrentMonthSpending(
    userId: string,
  ): Promise<ServiceResult<number>> {
    try {
      const now = new Date();
      const startDate = startOfMonth(now);
      const endDate = endOfMonth(now);

      const result = await db
        .select({
          total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)::float`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "debit"),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        );

      return { success: true, data: result[0]?.total ?? 0 };
    } catch (err) {
      console.error("[TransactionsService.getCurrentMonthSpending]", err);
      return {
        success: false,
        error: "Failed to calculate spending",
        code: "DB_ERROR",
      };
    }
  },
} as const;
