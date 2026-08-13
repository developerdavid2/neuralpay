import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildGetSpendingOverviewTool(userId: string) {
  return tool({
    description:
      "Get total spending and per-category breakdown for a period (7d/30d/90d). Use for 'show me my spending' or 'what's my spending breakdown'.",
    inputSchema: z.object({
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
    }),
    execute: async ({ period }) => {
      const now = new Date();
      const days = period === "7d" ? 6 : period === "90d" ? 89 : 29;
      const startDate = startOfDay(subDays(now, days));
      const endDate = endOfDay(now);

      const rows = await db
        .select({
          category: transactions.category,
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
            Number,
          ),
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
        .orderBy(desc(sql`SUM(${transactions.amount})`));

      return {
        period,
        totalSpending: rows.reduce((sum, r) => sum + r.total, 0),
        byCategory: rows,
      };
    },
  });
}
