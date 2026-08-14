import { randomUUID } from "node:crypto";
import { tool } from "ai";
import { z } from "zod";

export function buildProposeSpendingGoalTool(_userId: string) {
  return tool({
    description:
      "Draft a simple spending goal (not a full budget) for user confirmation — e.g. 'keep total spend under $X this month'. Never saves directly.",
    inputSchema: z.object({
      targetAmount: z.number().positive(),
      timeframe: z.enum(["this_week", "this_month"]),
      reasoning: z.string(),
    }),
    execute: async ({ targetAmount, timeframe, reasoning }) => {
      return {
        proposalId: randomUUID(),
        kind: "spending_goal" as const,
        draft: { targetAmount, timeframe },
        reasoning,
      };
    },
  });
}
