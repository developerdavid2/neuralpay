import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildSpendingChartTool(userId: string) {
  return tool({
    description:
      "Render an interactive chart of the user's spending — by category (pie/bar) or over time (area/line). Call this whenever a visual breakdown of spending would help answer the user's question, instead of just listing numbers in text.",
    inputSchema: z.object({
      chartType: z
        .enum(["pie", "bar", "area"])
        .describe(
          "pie/bar for spending-by-category comparisons; area for spending-over-time trends",
        ),
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
      title: z.string().describe("Short title for the chart"),
    }),
    execute: async ({ chartType, period, title }) => {
      const now = new Date();
      const days = period === "7d" ? 6 : period === "90d" ? 89 : 29;
      const startDate = startOfDay(subDays(now, days));
      const endDate = endOfDay(now);

      const categoryResult = await db
        .select({
          category: transactions.category,
          total: sql<string>`sum(${transactions.amount}::numeric)::text`,
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
        total: parseFloat(r.total ?? "0"),
      }));

      if (chartType !== "area") {
        return {
          chartType,
          title,
          data: categorySpending.map((c) => ({
            label: c.category,
            value: c.total,
          })),
        };
      }

      const trendDay = sql<Date>`date_trunc('day', ${transactions.date})`;
      const trendResult = await db
        .select({
          name: sql<string>`to_char(${trendDay}, 'Mon DD')`,
          value: sql<string>`sum(${transactions.amount}::numeric)::text`,
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

      return {
        chartType,
        title,
        data: trendResult.map((t) => ({
          label: t.name,
          value: parseFloat(t.value ?? "0"),
        })),
      };
    },
  });
}
