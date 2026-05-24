import z from "zod";

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

export const ACCOUNT_TYPE = [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
] as const;

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

export type AccountType = (typeof ACCOUNT_TYPE)[number];
export type TransactionCategory = (typeof TRANSACTION_CATEGORY)[number];
export type TransactionType = (typeof TRANSACTION_TYPE)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];

export const transactionSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  bankAccountId: z.uuid(),
  description: z.string(),
  amount: z.string(),
  type: z.enum(TRANSACTION_TYPE),
  status: z.enum(TRANSACTION_STATUS).nullable(),
  category: z.enum(TRANSACTION_CATEGORY).nullable(),
  merchant: z.string().nullable(),
  date: z.date(),
  isAnomaly: z.boolean(),
  anomalyScore: z.string().nullable(),
  notes: z.string().nullable(),
  plaidTxId: z.string().nullable(),
  monoTxId: z.string().nullable(),
  createdAt: z.date(),
});

export type TransactionRecord = z.infer<typeof transactionSchema>;

export const transactionsFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  bankAccountId: z.uuid().optional(),
  category: z.enum(TRANSACTION_CATEGORY).nullable().optional(),
  type: z.enum(TRANSACTION_TYPE).optional(),
  status: z.enum(TRANSACTION_STATUS).nullable().optional(),
  isAnomaly: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export type TransactionsFilterInput = z.infer<typeof transactionsFilterSchema>;

export const updateTransactionSchema = z.object({
  id: z.uuid(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  notes: z.string().optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
