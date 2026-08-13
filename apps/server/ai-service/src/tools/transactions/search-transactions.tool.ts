import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";

export function buildSearchTransactionsTool(userId: string) {
  return tool({
    description:
      "Search transactions by merchant/description text, category, type, or date range. Use for queries like 'find my Uber rides' or 'show my Amazon purchases last month'.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Text to search in merchant/description"),
      category: z.string().optional(),
      type: z.enum(["debit", "credit"]).optional(),
      dateFrom: z.string().optional().describe("ISO date string"),
      dateTo: z.string().optional().describe("ISO date string"),
      limit: z.number().int().min(1).max(30).default(15),
    }),
    execute: async ({ query, category, type, dateFrom, dateTo, limit }) => {
      const conditions = [eq(transactions.userId, userId)];
      if (category)
        conditions.push(eq(transactions.category, category as never));
      if (type) conditions.push(eq(transactions.type, type));
      if (dateFrom) conditions.push(gte(transactions.date, new Date(dateFrom)));
      if (dateTo) conditions.push(lte(transactions.date, new Date(dateTo)));
      if (query) {
        const s = `%${query}%`;
        const searchCond = or(
          ilike(transactions.description, s),
          ilike(transactions.merchant, s),
        );
        if (searchCond) conditions.push(searchCond);
      }

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
