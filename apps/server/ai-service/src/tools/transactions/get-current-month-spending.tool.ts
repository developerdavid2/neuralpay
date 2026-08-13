import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { endOfMonth, startOfMonth } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildGetCurrentMonthSpendingTool(userId: string) {
  return tool({
    description: "Get the user's total spending so far this calendar month.",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
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
            gte(transactions.date, startOfMonth(now)),
            lte(transactions.date, endOfMonth(now)),
          ),
        );
      return { total: result?.total ?? 0 };
    },
  });
}
