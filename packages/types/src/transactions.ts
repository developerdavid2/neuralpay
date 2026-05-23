import z from "zod";
import { createPaginatedSchema } from "./pagination";

export const TRANSACTION_CATEGORY = [
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

export const TRANSACTION_TYPE = ["debit", "credit"] as const;

export const TRANSACTION_STATUS = [
  "pending",
  "successful",
  "refunded",
  "reversed",
  "failed",
] as const;

export type TransactionRecord = {
  id: string;
  userId: string;
  bankAccountId: string;
  description: string;
  amount: string;
  type: (typeof TRANSACTION_TYPE)[number];
  status: (typeof TRANSACTION_STATUS)[number];
  category: (typeof TRANSACTION_CATEGORY)[number];
  merchant: string | null;
  date: Date;
  isAnomaly: boolean;
  anomalyScore: string | null;
  notes: string | null;
  plaidTxId: string | null;
  monoTxId: string | null;
  createdAt: Date;
};

export type TransactionWithAccount = TransactionRecord & {
  bankAccountName: string | null;
  bankAccountType: string | null;
  bankName: string | null;
  currency: string | null;
  maskedNumber?: string | null;
};

export type CategoryTotal = {
  category: string;
  total: number;
  count: number;
};

export type OverviewTotal = {
  totalSpending: number;
  totalBudget: number;
  categorySpending: Array<{
    category: string;
    total: number;
    budget: number;
  }>;
  trendData: Array<{
    name: string;
    value: number;
    budget: number;
    dailyBudget: number;
    date?: string;
  }>;
};

export type TopMonthlyCategories = {
  month: number;
  year: number;
  categories: Array<{
    category: string;
    total: number;
    percentage: number;
    count: number;
  }>;
  totalSpending: number;
  hasData: boolean;
};

export type TransactionPage = {
  items: TransactionWithAccount[];
  nextCursor: string | null;
};

// ── Zod schemas (pure, no db imports) ─────────────────────────────────────────
export const transactionsFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  bankAccountId: z.string().uuid().optional(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  type: z.enum(TRANSACTION_TYPE).optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  isAnomaly: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export type TransactionsFilterInput = z.infer<typeof transactionsFilterSchema>;

export const listTransactionsInputSchema = transactionsFilterSchema;
export type ListTransactionsInput = z.infer<typeof listTransactionsInputSchema>;

export const updateTransactionInputSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  notes: z.string().optional(),
});

export type UpdateTransactionInput = z.infer<
  typeof updateTransactionInputSchema
>;

// ── Pure zod schema for paginated response (replaces imported transactionSchema) ─
export const transactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  bankAccountId: z.string().uuid(),
  description: z.string(),
  amount: z.string(),
  type: z.enum(TRANSACTION_TYPE),
  status: z.enum(TRANSACTION_STATUS),
  category: z.enum(TRANSACTION_CATEGORY),
  merchant: z.string().nullable(),
  date: z.date(),
  isAnomaly: z.boolean(),
  anomalyScore: z.string().nullable(),
  notes: z.string().nullable(),
  plaidTxId: z.string().nullable(),
  monoTxId: z.string().nullable(),
  createdAt: z.date(),
});

export const transactionPageSchema = createPaginatedSchema(transactionSchema);
export type TransactionPageSchema = z.infer<typeof transactionPageSchema>;
