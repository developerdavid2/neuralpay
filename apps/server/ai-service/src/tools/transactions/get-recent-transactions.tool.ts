import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export function buildGetRecentTransactionsTool(userId: string) {
  return tool({
    description:
      "Get the user's most recent transactions, optionally filtered by category. Use when the user asks about recent spending not already in context.",
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe("Filter to a specific category, if mentioned"),
      limit: z.number().int().min(1).max(30).default(10),
    }),
    execute: async ({ category, limit }) => {
      const conditions = [eq(transactions.userId, userId)];
      if (category)
        conditions.push(eq(transactions.category, category as never));

      const rows = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          merchant: transactions.merchant,
          amount: transactions.amount,
          category: transactions.category,
          type: transactions.type,
          date: transactions.date,
        })
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.date))
        .limit(limit);
      return rows;
    },
  });
}
