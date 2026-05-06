import { db } from "@neuralpay/db";
import { transactions, type TransactionRecord } from "@neuralpay/db/schema";
import {
  type CategoryTotal,
  type ListTransactionsInput,
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
      // Remove the last item if ther eis more data

      const items = hasMore ? data.slice(0, -1) : data;
      //Set the next cursor to the last irme if there is more data

      const lastItem = items[items.length - 1];
      console.log({ lastItem });

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

  // Groups spending by category for the current month — used by dashboard donut chart
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
            eq(transactions.type, "debit"), // only outgoing
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

  // Month-over-month spending totals — used by dashboard trend
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
            gte(transactions.date, startOfDay(subMonths(now, 5))), // get transaction date using current's date , but exactly five months today from 00:00:00
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

  // Current month spending total — used by stat cards
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
