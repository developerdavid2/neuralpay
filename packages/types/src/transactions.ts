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

export const categoryFilterSchema = z
  .union([z.enum(TRANSACTION_CATEGORY), z.uuid()])
  .optional();

export const transactionsFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  bankAccountId: z.uuid().optional(),
  category: categoryFilterSchema,
  type: z.enum(TRANSACTION_TYPE).optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  isAnomaly: z.boolean().optional(),
  isManual: z.boolean().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export const createTransactionSchema = z
  .object({
    bankAccountId: z.uuid(),
    description: z.string().min(1).max(500),
    amount: z.number().positive(),
    type: z.enum(TRANSACTION_TYPE),
    status: z.enum(TRANSACTION_STATUS).default("successful"),
    // One of these, not both
    category: z.enum(TRANSACTION_CATEGORY).optional(),
    customCategoryId: z.uuid().optional(),
    merchant: z.string().max(200).optional(),
    date: z.iso.datetime(),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.category && val.customCategoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either category or customCategoryId, not both",
        path: ["category"],
      });
    }
  });

export const updateTransactionSchema = z.object({
  id: z.uuid(),
  description: z.string().min(1).max(500).optional(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  customCategoryId: z.uuid().optional().nullable(),
  merchant: z.string().max(200).optional(),
  notes: z.string().max(1000).optional().nullable(),
  date: z.iso.datetime().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(TRANSACTION_TYPE).optional(),
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
  // If no type column, infer from amount sign (negative = debit)
  inferTypeFromSign: z.boolean().default(true),
  // Date format hint: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  dateFormat: z
    .enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
    .default("YYYY-MM-DD"),
  // Amount format: some CSVs use parentheses for negatives
  amountFormat: z.enum(["standard", "parentheses"]).default("standard"),
  // Skip header row
  hasHeader: z.boolean().default(true),
});

export const csvImportSchema = z.object({
  bankAccountId: z.uuid(),
  filename: z.string(),
  // rows is the parsed CSV — array of string arrays
  // Each inner array is one row, each element is a cell value
  rows: z.array(z.array(z.string())),
  mapping: csvColumnMappingSchema,
});

export const createCustomCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().max(50).optional(), // lucide icon name
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional(),
});

export const updateCustomCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type TransactionsFilterInput = z.infer<typeof transactionsFilterSchema>;
export type ListTransactionsInput = z.infer<typeof transactionsFilterSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>;
export type CsvImportInput = z.infer<typeof csvImportSchema>;
export type CsvColumnMapping = z.infer<typeof csvColumnMappingSchema>;
export type CreateCustomCategoryInput = z.infer<
  typeof createCustomCategorySchema
>;
export type UpdateCustomCategoryInput = z.infer<
  typeof updateCustomCategorySchema
>;

export type TransactionWithAccount = {
  id: string;
  userId: string;
  bankAccountId: string;
  description: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus | null;
  category: TransactionCategory | null;
  customCategoryId: string | null;
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
  customCategoryName: string | null;
  customCategoryIcon: string | null;
  customCategoryColor: string | null;
};

export type PaginatedTransactions = {
  items: TransactionWithAccount[];
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
