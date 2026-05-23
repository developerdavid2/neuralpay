import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  transactionSchema,
  type TransactionRecord,
} from "@neuralpay/db";
import z from "zod";
import { createPaginatedSchema } from "./pagination";

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

export type TransactionWithAccount = TransactionRecord & {
  bankAccountName: string | null;
  bankAccountType: string | null;
  bankName: string | null;
  currency: string | null;
};

export type TransactionPage = {
  items: TransactionWithAccount[];
  nextCursor: string | null;
};

export const transactionsFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  bankAccountId: z.uuid().optional(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  type: z.enum(TRANSACTION_TYPE).optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  isAnomaly: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});
export type TransactionsFilterInput = z.infer<typeof transactionsFilterSchema>;
export const listTransactionsInputSchema = transactionsFilterSchema;
export type ListTransactionsInput = z.infer<typeof listTransactionsInputSchema>;

// UPDATE TRANSACTION
export const updateTransactionInputSchema = z.object({
  id: z.uuid(),
  category: z.enum(TRANSACTION_CATEGORY).optional(),
  notes: z.string().optional(),
});
export type UpdateTransactionInput = z.infer<
  typeof updateTransactionInputSchema
>;

export const transactionPageSchema = createPaginatedSchema(transactionSchema);
export type transactionPage = z.infer<typeof transactionPageSchema>;
