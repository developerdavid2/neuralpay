import { randomUUID } from "node:crypto";
import { db } from "@orra/db";
import { transactions } from "@orra/db/schema";
import { tool } from "ai";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export function buildProposeRecategorizeTool(userId: string) {
  return tool({
    description:
      "Draft a proposal to recategorize one or more transactions. Never updates directly. Use when a transaction looks miscategorized or the user wants to bulk-fix a category.",
    inputSchema: z.object({
      transactionIds: z.array(z.string()).min(1).max(50),
      targetCategory: z.string(),
      reasoning: z.string(),
    }),
    execute: async ({ transactionIds, targetCategory, reasoning }) => {
      const rows = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          merchant: transactions.merchant,
          amount: transactions.amount,
          category: transactions.category,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            inArray(transactions.id, transactionIds),
          ),
        );

      if (rows.length === 0) return { error: "No matching transactions found" };

      return {
        proposalId: randomUUID(),
        kind: "recategorize" as const,
        targetCategory,
        changes: rows.map((r) => ({
          transactionId: r.id,
          description: r.description,
          merchant: r.merchant,
          amount: r.amount,
          from: r.category,
          to: targetCategory,
        })),
        reasoning,
      };
    },
  });
}
