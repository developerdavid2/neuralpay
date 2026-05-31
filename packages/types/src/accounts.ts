import { z } from "zod";
import type { PaginatedResult } from "./pagination";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
] as const;

export const ACCOUNT_STATUSES = ["active", "disconnected"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const createAccountSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(ACCOUNT_TYPES),
  subtype: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  bankName: z.string().max(200).optional(),
  maskedNumber: z.string().max(30).optional(),
  balance: z.number().default(0),
  currency: z.string().length(3).default("USD"),
});

export const updateAccountSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(200).optional(),
  subtype: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  bankName: z.string().max(200).optional(),
  balance: z.number().optional(),
  currency: z.string().length(3).optional(),
});

export const accountsFilterSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  type: z
    .union([z.enum(ACCOUNT_TYPES), z.array(z.enum(ACCOUNT_TYPES))])
    .optional(),
  status: z
    .union([z.enum(ACCOUNT_STATUSES), z.array(z.enum(ACCOUNT_STATUSES))])
    .optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type AccountsFilterInput = z.infer<typeof accountsFilterSchema>;

export type BankAccountRecord = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: "checking" | "savings" | "credit" | "investment" | "crypto";
  subtype: string | null;
  tags: string[];
  bankName: string | null;
  maskedNumber: string | null;
  balance: string | null;
  currency: string;
  isManual: boolean;
  status: string;
  plaidItemId: string | null;
  plaidAccountId: string | null;
  monoAccountId: string | null;
  lastSyncedAt: Date | null;
};

export type PaginatedAccounts = PaginatedResult<BankAccountRecord>;

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
