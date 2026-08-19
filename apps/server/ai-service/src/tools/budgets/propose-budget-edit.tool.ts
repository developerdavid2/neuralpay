import { randomUUID } from "node:crypto";
import { db } from "@orra/db";
import { budgetCategories, budgets } from "@orra/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export function buildProposeBudgetEditTool(userId: string) {
  return tool({
    description:
      "Draft changes to an existing budget for user confirmation (never edits directly). Use when suggesting a user raise/lower a limit, add/remove a category, or change the alert threshold.",
    inputSchema: z.object({
      budgetId: z.string(),
      changes: z.object({
        name: z.string().optional(),
        categories: z
          .array(
            z.object({
              category: z.string(),
              limitAmount: z.number().positive(),
            }),
          )
          .optional(),
        alertThreshold: z.number().int().min(1).max(100).optional(),
      }),
      reasoning: z.string(),
    }),
    execute: async ({ budgetId, changes, reasoning }) => {
      const [current] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
        .limit(1);

      if (!current) return { error: "Budget not found" };

      const currentCategories = await db
        .select()
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budgetId));

      const proposedLimitAmount = changes.categories
        ? changes.categories.reduce((sum, c) => sum + c.limitAmount, 0)
        : Number(current.limitAmount);

      return {
        proposalId: randomUUID(),
        kind: "budget_edit" as const,
        budgetId,
        current: {
          name: current.name,
          limitAmount: Number(current.limitAmount),
          alertThreshold: current.alertThreshold,
          categories: currentCategories.map((c) => ({
            category: c.category,
            limitAmount: Number(c.limitAmount),
          })),
        },
        proposed: {
          name: changes.name ?? current.name,
          limitAmount: proposedLimitAmount,
          alertThreshold: changes.alertThreshold ?? current.alertThreshold,
          categories:
            changes.categories ??
            currentCategories.map((c) => ({
              category: c.category,
              limitAmount: Number(c.limitAmount),
            })),
        },
        reasoning,
      };
    },
  });
}
