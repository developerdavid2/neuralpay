import { randomUUID } from "node:crypto";
import { db } from "@orra/db";
import { budgets } from "@orra/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export function buildProposeBudgetDeleteTool(userId: string) {
  return tool({
    description:
      "Draft a proposal to delete a budget for user confirmation (never deletes directly). Use when the user asks to remove a budget or when suggesting cleanup of a stale one — always explain why.",
    inputSchema: z.object({
      budgetId: z.string(),
      reasoning: z.string(),
    }),
    execute: async ({ budgetId, reasoning }) => {
      const [budget] = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          limitAmount: budgets.limitAmount,
        })
        .from(budgets)
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
        .limit(1);

      if (!budget) return { error: "Budget not found" };

      return {
        proposalId: randomUUID(),
        kind: "budget_delete" as const,
        budgetId: budget.id,
        budgetName: budget.name,
        reasoning,
      };
    },
  });
}
