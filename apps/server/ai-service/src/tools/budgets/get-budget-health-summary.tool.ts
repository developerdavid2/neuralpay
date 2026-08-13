import { db } from "@neuralpay/db";
import { budgetCategories, budgets, transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { differenceInCalendarDays } from "date-fns";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";

function healthFor(percentUsed: number, threshold: number) {
  if (percentUsed >= 100) return "over";
  if (percentUsed >= threshold) return "warning";
  return "on_track";
}

export function buildGetBudgetHealthSummaryTool(userId: string) {
  return tool({
    description:
      "Get a health status (on_track / warning / over) for every active budget in one call, with percent used and days remaining. Use when the user asks 'how am I doing on my budgets' or 'which budgets are at risk' — don't call getBudgetById repeatedly for this.",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();

      const activeBudgets = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)));

      if (activeBudgets.length === 0) return [];

      const budgetIds = activeBudgets.map((b) => b.id);
      const categoryRows = await db
        .select()
        .from(budgetCategories)
        .where(inArray(budgetCategories.budgetId, budgetIds));

      const results = await Promise.all(
        activeBudgets.map(async (budget) => {
          const cats = categoryRows.filter((c) => c.budgetId === budget.id);
          const spendByCategory = await Promise.all(
            cats.map(async (c) => {
              const [result] = await db
                .select({
                  total:
                    sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
                      Number,
                    ),
                })
                .from(transactions)
                .where(
                  and(
                    eq(transactions.userId, userId),
                    eq(transactions.type, "debit"),
                    eq(transactions.category, c.category),
                    gte(transactions.date, budget.startDate),
                    lte(transactions.date, budget.endDate),
                  ),
                );
              return result?.total ?? 0;
            }),
          );

          const totalSpent = spendByCategory.reduce((s, v) => s + v, 0);
          const totalLimit = Number(budget.limitAmount);
          const percentUsed =
            totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
          const daysRemaining = Math.max(
            0,
            differenceInCalendarDays(new Date(budget.endDate), now),
          );

          return {
            id: budget.id,
            name: budget.name,
            limitAmount: totalLimit,
            totalSpent,
            percentUsed,
            status: healthFor(percentUsed, budget.alertThreshold),
            daysRemaining,
          };
        }),
      );

      return results;
    },
  });
}
