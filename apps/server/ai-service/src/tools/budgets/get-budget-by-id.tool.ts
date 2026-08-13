import { db } from "@neuralpay/db";
import { budgetCategories, budgets } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export function buildGetBudgetByIdTool(userId: string) {
  return tool({
    description:
      "Get full detail on a specific budget by id: limit, categories, spend, linked accounts. Use when the user references a budget not already in the current context.",
    inputSchema: z.object({ budgetId: z.string() }),
    execute: async ({ budgetId }) => {
      const [budget] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
        .limit(1);

      if (!budget) return { error: "Budget not found" };

      const categories = await db
        .select()
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budgetId));

      return { budget, categories };
    },
  });
}
