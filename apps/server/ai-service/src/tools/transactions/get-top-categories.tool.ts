import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildGetTopCategoriesTool(userId: string) {
  return tool({
    description:
      "Get the user's top spending categories for a given month/year, ranked with percentage of total. Use for 'what do I spend most on'.",
    inputSchema: z.object({
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().optional(),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ month, year, limit }) => {
      const now = new Date();
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const rows = await db
        .select({
          category: transactions.category,
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
            Number,
          ),
          count: sql<number>`COUNT(*)`.mapWith(Number),
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
        .orderBy(desc(sql`SUM(${transactions.amount})`))
        .limit(limit);

      const total = rows.reduce((sum, r) => sum + r.total, 0);
      return rows.map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.total / total) * 1000) / 10 : 0,
      }));
    },
  });
}
