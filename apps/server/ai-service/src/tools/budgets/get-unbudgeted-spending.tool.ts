import { db } from "@neuralpay/db";
import { budgetCategories, budgets, transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { startOfMonth } from "date-fns";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

export function buildGetUnbudgetedSpendingTool(userId: string) {
  return tool({
    description:
      "Find spending categories the user spent money on this month that no active budget covers. Use for 'what should I budget for that I haven't yet'.",
    inputSchema: z.object({}),
    execute: async () => {
      const monthStart = startOfMonth(new Date());

      const spendByCategory = await db
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
            gte(transactions.date, monthStart),
          ),
        )
        .groupBy(transactions.category);

      const budgetedCategories = await db
        .select({ category: budgetCategories.category })
        .from(budgetCategories)
        .innerJoin(budgets, eq(budgets.id, budgetCategories.budgetId))
        .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)));

      const budgetedSet = new Set(budgetedCategories.map((b) => b.category));

      return spendByCategory
        .filter(
          (s) => s.category && !budgetedSet.has(s.category) && s.total > 0,
        )
        .map((s) => ({ category: s.category, currentMonthSpend: s.total }))
        .sort((a, b) => b.currentMonthSpend - a.currentMonthSpend);
    },
  });
}
