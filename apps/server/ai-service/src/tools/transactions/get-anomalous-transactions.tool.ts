import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export function buildGetAnomalousTransactionsTool(userId: string) {
  return tool({
    description:
      "Get transactions flagged as anomalous (isAnomaly=true). Use when the user asks to review unusual or flagged activity.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(20).default(10),
    }),
    execute: async ({ limit }) => {
      const rows = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          merchant: transactions.merchant,
          amount: transactions.amount,
          category: transactions.category,
          date: transactions.date,
          anomalyScore: transactions.anomalyScore,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.isAnomaly, true),
          ),
        )
        .orderBy(desc(transactions.date))
        .limit(limit);
      return rows;
    },
  });
}
