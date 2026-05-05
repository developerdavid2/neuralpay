import z from "zod";
import type { TransactionRecord } from "@neuralpay/db";
import { paginationSchema, type PaginationInput } from "./pagination";

export type CategoryTotal = {
  category: string;
  total: number;
  count: number;
};

export type TransactionPage = {
  items: TransactionRecord[];
  nextCursor: string | null; // null means no more pages
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

export type transactionsFilterInput = z.infer<typeof transactionsFilterSchema> &
  PaginationInput;

export const listTransactionsInputSchema = transactionsFilterSchema.extend(
  paginationSchema.shape,
);

export type ListTransactionsInput = z.infer<typeof listTransactionsInputSchema>;
