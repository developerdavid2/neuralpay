import { randomUUID } from "node:crypto";
import { tool } from "ai";
import { z } from "zod";

export function buildProposeAccountCreateTool(_userId: string) {
  return tool({
    description:
      "Draft a new manual account for user confirmation. Never creates directly. Use when the user wants to track an account not synced via Plaid.",
    inputSchema: z.object({
      name: z.string(),
      type: z.enum(["checking", "savings", "credit", "investment"]),
      balance: z.number().default(0),
      bankName: z.string().optional(),
      reasoning: z.string(),
    }),
    execute: async ({ name, type, balance, bankName, reasoning }) => {
      return {
        proposalId: randomUUID(),
        kind: "account_create" as const,
        draft: { name, type, balance, bankName: bankName ?? null },
        reasoning,
      };
    },
  });
}
