import type { TransactionRecord } from "@neuralpay/db";
import z from "zod";
import { paginationSchema } from "./pagination";

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

export type TransactionPage = {
  items: TransactionRecord[];
  nextCursor: string | null;
};

export const transactionsFilterSchema = z.object({
  bankAccountId: z.uuid().optional(),
  category: z.string().optional(),
  type: z.enum(["debit", "credit"]).optional(),
  isAnomaly: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
});

export const listTransactionsInputSchema = transactionsFilterSchema.extend(
  paginationSchema.shape,
);

export type ListTransactionsInput = z.infer<typeof listTransactionsInputSchema>;
