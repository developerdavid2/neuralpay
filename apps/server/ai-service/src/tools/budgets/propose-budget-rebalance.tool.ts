import { randomUUID } from "node:crypto";
import { db } from "@neuralpay/db";
import { budgets } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export function buildProposeBudgetRebalanceTool(userId: string) {
  return tool({
    description:
      "Draft a multi-step plan to shift budget allocation between two or more budgets (e.g. reduce an under-used budget, increase an over-budget one). Never applies changes directly. Use only after checking getBudgetHealthSummary to ground the proposal in real usage.",
    inputSchema: z.object({
      steps: z
        .array(
          z.object({
            budgetId: z.string(),
            changeAmount: z
              .number()
              .describe("Positive to increase limit, negative to decrease"),
            reason: z.string(),
          }),
        )
        .min(2)
        .max(5),
      overallReasoning: z.string(),
    }),
    execute: async ({ steps, overallReasoning }) => {
      const budgetIds = steps.map((s) => s.budgetId);
      const rows = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          limitAmount: budgets.limitAmount,
        })
        .from(budgets)
        .where(and(eq(budgets.userId, userId), inArray(budgets.id, budgetIds)));

      const rowMap = new Map(rows.map((r) => [r.id, r]));

      const planSteps = steps.map((step, i) => {
        const budget = rowMap.get(step.budgetId);
        const currentLimit = budget ? Number(budget.limitAmount) : null;
        return {
          order: i + 1,
          budgetId: step.budgetId,
          budgetName: budget?.name ?? "Unknown budget",
          currentLimit,
          newLimit:
            currentLimit !== null ? currentLimit + step.changeAmount : null,
          changeAmount: step.changeAmount,
          reason: step.reason,
        };
      });

      return {
        proposalId: randomUUID(),
        kind: "budget_rebalance" as const,
        steps: planSteps,
        overallReasoning,
      };
    },
  });
}
