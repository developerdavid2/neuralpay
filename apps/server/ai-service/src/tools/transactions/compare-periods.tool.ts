import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

async function totalFor(userId: string, start: Date, end: Date) {
  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    );
  return result?.total ?? 0;
}

export function buildComparePeriodsTool(userId: string) {
  return tool({
    description:
      "Compare total spending between the current period and the immediately preceding period of the same length (e.g. this month vs last month). Use for 'am I spending more than usual'.",
    inputSchema: z.object({
      periodDays: z.number().int().min(1).max(90).default(30),
    }),
    execute: async ({ periodDays }) => {
      const now = new Date();
      const currentStart = startOfDay(subDays(now, periodDays - 1));
      const currentEnd = endOfDay(now);
      const previousStart = startOfDay(subDays(now, periodDays * 2 - 1));
      const previousEnd = endOfDay(subDays(now, periodDays));

      const [current, previous] = await Promise.all([
        totalFor(userId, currentStart, currentEnd),
        totalFor(userId, previousStart, previousEnd),
      ]);

      const change =
        previous > 0
          ? Math.round(((current - previous) / previous) * 1000) / 10
          : null;

      return { current, previous, percentChange: change };
    },
  });
}
