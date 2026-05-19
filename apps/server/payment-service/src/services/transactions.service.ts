import { db } from "@neuralpay/db";
import {
  budgets,
  transactions,
  type TransactionRecord,
} from "@neuralpay/db/schema";
import {
  type ListTransactionsInput,
  type OverviewTotal,
  type PaginatedResult,
  type ServiceResult,
  type TopMonthlyCategories,
} from "@neuralpay/types";
import {
  differenceInDays,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

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

  async recent(
    userId: string,
    limit: number,
  ): Promise<ServiceResult<TransactionRecord[]>> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date))
        .limit(limit);

      return {
        success: true,
        data: result,
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
      let endDate: Date;

      if (period === "7d") {
        startDate = startOfDay(subDays(new Date(), 7));
        endDate = endOfDay(new Date());
      } else if (period === "30d") {
        startDate = startOfDay(subDays(new Date(), 30));
        endDate = endOfDay(new Date());
      } else if (period === "90d") {
        startDate = startOfDay(subDays(new Date(), 90));
        endDate = endOfDay(new Date());
      } else if (from && to) {
        startDate = startOfDay(new Date(from));
        endDate = endOfDay(new Date(to));
      } else {
        startDate = startOfDay(subDays(new Date(), 30));
        endDate = endOfDay(new Date());
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
      const trendDay = sql<Date>`date_trunc('day', ${transactions.date})`;
      const trendResult = await db
        .select({
          date: trendDay,
          name: sql<string>`to_char(${trendDay}, 'Mon DD')`,
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
        .groupBy(trendDay)
        .orderBy(trendDay);

      // 3. Generate (month, year) pairs for the query period
      const monthYearPairs: Array<{ month: number; year: number }> = [];
      let currentDate = startOfMonth(startDate);
      const periodEnd = endOfMonth(endDate);

      while (currentDate <= periodEnd) {
        monthYearPairs.push({
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        });
        currentDate = startOfMonth(subMonths(currentDate, -1)); // Move to next month
      }

      // Query budgets for all months in the period
      let budgetResult: Array<any> = [];
      if (monthYearPairs.length > 0) {
        // Build OR conditions for each (month, year) pair
        const monthYearConditions = monthYearPairs.map((p) =>
          and(eq(budgets.month, p.month), eq(budgets.year, p.year)),
        );

        const whereCondition =
          monthYearConditions.length === 1
            ? monthYearConditions[0]
            : or(...monthYearConditions);

        budgetResult = await db
          .select({
            category: budgets.category,
            month: budgets.month,
            year: budgets.year,
            limitAmount: sql<number>`${budgets.limitAmount}::numeric`,
          })
          .from(budgets)
          .where(and(eq(budgets.userId, userId), whereCondition));
      }

      // Aggregate budgets by category (sum limits per category across all months)
      const categoryBudgetMap = new Map<string, number>();
      budgetResult.forEach((b) => {
        const current = categoryBudgetMap.get(b.category) || 0;
        categoryBudgetMap.set(b.category, current + Number(b.limitAmount));
      });

      // Calculate budget metrics
      const totalBudget = Array.from(categoryBudgetMap.values()).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      const daysInPeriod = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end days
      const dailyBudget = daysInPeriod > 0 ? totalBudget / daysInPeriod : 0;

      // 4. Build trend data with spending + budget
      const trendData = trendResult.map((t) => {
        // Calculate days elapsed from start of period to this date
        const daysElapsedInRange = differenceInDays(
          new Date(t.date),
          startDate,
        );
        const budgetProgress = dailyBudget * (daysElapsedInRange + 1); // +1 to include the current day

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

  async getTopCategories(
    userId: string,
    month: number,
    year: number,
    limit = 5,
  ): Promise<ServiceResult<TopMonthlyCategories>> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get category totals
      const categoryResult = await db
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
        .orderBy(desc(sql`sum(${transactions.amount}::numeric)`))
        .limit(limit);

      if (categoryResult.length === 0) {
        return {
          success: true,
          data: {
            month,
            year,
            categories: [],
            totalSpending: 0,
            hasData: false,
          },
        };
      }

      // Calculate total for percentage
      const totalResult = await db
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

      const totalSpending = totalResult[0]?.total ?? 0;

      const categories = categoryResult.map((r) => ({
        category: r.category ?? "other",
        total: r.total,
        count: r.count,
        percentage:
          totalSpending > 0
            ? Math.round((r.total / totalSpending) * 1000) / 10 // 1 decimal
            : 0,
      }));

      return {
        success: true,
        data: {
          month,
          year,
          categories,
          totalSpending,
          hasData: true,
        },
      };
    } catch (err) {
      console.error("[TransactionsService.getTopCategories]", err);
      return {
        success: false,
        error: "Failed to fetch top categories",
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
