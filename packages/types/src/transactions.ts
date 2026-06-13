import { z } from "zod";

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

export type TransactionCategory = (typeof TRANSACTION_CATEGORY)[number];
export type TransactionType = (typeof TRANSACTION_TYPE)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];

export const transactionsFilterSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  bankAccountId: z.uuid().optional(),
  category: z
    .union([
      z.enum(TRANSACTION_CATEGORY),
      z.array(z.enum(TRANSACTION_CATEGORY)),
    ])
    .optional(),
  type: z
    .union([z.enum(TRANSACTION_TYPE), z.array(z.enum(TRANSACTION_TYPE))])
    .optional(),
  status: z
    .union([z.enum(TRANSACTION_STATUS), z.array(z.enum(TRANSACTION_STATUS))])
    .optional(),
  isAnomaly: z.boolean().optional(),
  isManual: z.boolean().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export const createTransactionSchema = z.object({
  bankAccountId: z.uuid(),
  description: z.string().min(1).max(500),
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(TRANSACTION_TYPE),
  status: z.enum(TRANSACTION_STATUS),
  category: z.enum(TRANSACTION_CATEGORY),
  merchant: z.string().max(200).optional(),
  date: z.date(),
  notes: z.string().max(1000).optional(),
  isManual: z.literal(true).default(true),
});

export const updateTransactionSchema = z.object({
  id: z.uuid(),
  bankAccountId: z.uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(TRANSACTION_TYPE).optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  merchant: z.string().max(200).optional(),
  notes: z.string().max(1000).optional().nullable(),
  date: z.date().optional(),
});

export const batchDeleteSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(100),
});

export const csvColumnMappingSchema = z.object({
  date: z.number().int().min(0),
  amount: z.number().int().min(0),
  description: z.number().int().min(0),
  merchant: z.number().int().min(0).optional(),
  type: z.number().int().min(0).optional(),
  inferTypeFromSign: z.boolean().default(true),
  dateFormat: z
    .enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
    .default("YYYY-MM-DD"),
  amountFormat: z.enum(["standard", "parentheses"]).default("standard"),
  hasHeader: z.boolean().default(true),
});

export const csvImportSchema = z.object({
  bankAccountId: z.uuid(),
  filename: z.string(),
  rows: z.array(z.array(z.string())),
  mapping: csvColumnMappingSchema,
});

export type TransactionsFilterInput = z.infer<typeof transactionsFilterSchema>;
export type ListTransactionsInput = z.infer<typeof transactionsFilterSchema>;
export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>;
export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>;
export type CsvImportInput = z.infer<typeof csvImportSchema>;
export type CsvColumnMapping = z.infer<typeof csvColumnMappingSchema>;

export type Transaction = {
  id: string;
  userId: string;
  bankAccountId: string;
  description: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus | null;
  category: TransactionCategory | null;
  merchant: string | null;
  date: Date;
  isAnomaly: boolean;
  anomalyScore: string | null;
  notes: string | null;
  isManual: boolean;
  plaidTxId: string | null;
  monoTxId: string | null;
  csvImportId: string | null;
  createdAt: Date;
  // Joined from bankAccounts
  bankAccountName: string | null;
  bankAccountType: string | null;
  bankName: string | null;
  currency: string | null;
  maskedNumber: string | null;
  // Joined from customCategories
};
export type PaginatedTransactions = {
  items: Transaction[];
  nextCursor: string | null;
  total?: number;
};

export type OverviewTotal = {
  totalSpending: number;
  totalBudget: number;
  categorySpending: Array<{ category: string; total: number; budget: number }>;
  trendData: Array<{
    name: string;
    value: number;
    budget: number;
    dailyBudget: number;
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

export type CsvPreviewRow = {
  rowIndex: number;
  raw: string[];
  parsed: {
    date: string | null;
    description: string | null;
    merchant: string | null;
    amount: number | null;
    type: TransactionType | null;
  };
  isValid: boolean;
  errors: string[];
};

export type CsvImportPreview = {
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  preview: CsvPreviewRow[];
  headers: string[];
};

export type CsvImportResult = {
  importId: string;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
};
