import { db } from "@neuralpay/db";
import { transactions } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";
import { stripFields } from "../../lib/strip-fields";
import { datetimeInput, uuidInput } from "../lib/lean-schemas";

const TRANSACTION_ALLOWED = [
  "id",
  "description",
  "merchant",
  "amount",
  "category",
  "type",
  "status",
  "date",
  "isAnomaly",
  "anomalyScore",
  "bankAccountId",
  "notes",
] as const;

const CATEGORIES = [
  "food_dining",
  "utilities",
  "rent",
  "transport",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "transfer",
  "income",
  "investment",
  "subscriptions",
  "groceries",
  "other",
] as const;

const STATUSES = [
  "pending",
  "successful",
  "refunded",
  "reversed",
  "failed",
] as const;

export function buildQueryTransactionsTool(userId: string) {
  return tool({
    description:
      "Search, list, and filter transactions by merchant/description text, category, type, status, bank account, or date range; optionally surface only anomalies or include notes. Use for 'show my recent transactions', 'find my Uber rides', or 'any refunds last month?'.",
    inputSchema: z.object({
      query: z.string().max(200).optional(),
      category: z.enum(CATEGORIES).optional(),
      type: z.enum(["debit", "credit"]).optional(),
      status: z.enum(STATUSES).optional(),
      accountId: uuidInput().optional(),
      dateFrom: datetimeInput().optional(),
      dateTo: datetimeInput().optional(),
      onlyAnomalies: z.boolean().optional().default(false),
      orderBy: z
        .enum(["date_desc", "date_asc", "amount_desc", "amount_asc"])
        .optional()
        .default("date_desc"),
      limit: z.number().int().min(1).max(50).default(15),
      includeNotes: z.boolean().optional().default(false),
    }),
    execute: async ({
      query,
      category,
      type,
      status,
      accountId,
      dateFrom,
      dateTo,
      onlyAnomalies,
      orderBy,
      limit,
      includeNotes,
    }) => {
      const conditions = [eq(transactions.userId, userId)];
      if (query) {
        const s = `%${query}%`;
        const searchCond = or(
          ilike(transactions.description, s),
          ilike(transactions.merchant, s),
        );
        if (searchCond) conditions.push(searchCond);
      }
      if (category) conditions.push(eq(transactions.category, category as never));
      if (type) conditions.push(eq(transactions.type, type));
      if (status) conditions.push(eq(transactions.status, status));
      if (accountId) conditions.push(eq(transactions.bankAccountId, accountId));
      if (dateFrom) conditions.push(gte(transactions.date, new Date(dateFrom)));
      if (dateTo) conditions.push(lte(transactions.date, new Date(dateTo)));
      if (onlyAnomalies) conditions.push(eq(transactions.isAnomaly, true));

      const order = (() => {
        switch (orderBy) {
          case "date_asc":
            return asc(transactions.date);
          case "amount_desc":
            return desc(transactions.amount);
          case "amount_asc":
            return asc(transactions.amount);
          default:
            return desc(transactions.date);
        }
      })();

      const rows = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          merchant: transactions.merchant,
          amount: transactions.amount,
          category: transactions.category,
          type: transactions.type,
          status: transactions.status,
          date: transactions.date,
          isAnomaly: transactions.isAnomaly,
          anomalyScore: transactions.anomalyScore,
          bankAccountId: transactions.bankAccountId,
          notes: transactions.notes,
        })
        .from(transactions)
        .where(and(...conditions))
        .orderBy(order)
        .limit(limit);

      if (includeNotes) return stripFields(rows, TRANSACTION_ALLOWED);
      return stripFields(rows, TRANSACTION_ALLOWED).map((r) => ({
        id: r.id,
        description: r.description,
        merchant: r.merchant,
        amount: r.amount,
        category: r.category,
        type: r.type,
        status: r.status,
        date: r.date,
        isAnomaly: r.isAnomaly,
        anomalyScore: r.anomalyScore,
        bankAccountId: r.bankAccountId,
      }));
    },
  });
}
