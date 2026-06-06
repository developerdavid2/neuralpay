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
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "NGN",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export type SupportedCurrencies = (typeof SUPPORTED_CURRENCIES)[number];

export const createAccountSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Account Name is required"
          : "Account Name must be text",
    })
    .min(3, { error: "The account name must be a minimum of 3 characters" })
    .max(200, { error: "Account name is too long" }),
  type: z.enum(ACCOUNT_TYPES, {
    error: (issue) =>
      issue.code === "invalid_value"
        ? "Please select a valid account type"
        : "Account type is required",
  }),
  subtype: z.string().max(100, { error: "Subtype is too long" }).optional(),
  tags: z
    .array(z.string().max(50, { error: "Tag cannot exceed 50 characters" }))
    .max(10, { error: "You can add a maximum of 10 tags" })
    .default([]),
  bankName: z
    .string()
    .min(3, { error: "Bank name must be at least 3 characters" })
    .max(200, { error: "Bank name is too long" })
    .optional(),
  maskedNumber: z
    .string()
    .max(4, { error: "Account number is too long" })
    .optional(),
  balance: z
    .number({
      error: "Balance must be a valid number",
    })
    .default(0),
  currency: z
    .enum(SUPPORTED_CURRENCIES, {
      error: "Currency must be a valid ISO code (USD, EUR, GBP, etc.)",
    })
    .default("USD"),
  isManual: z.literal(true).default(true),
});

export const updateAccountSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(200).optional(),
  type: z
    .enum(ACCOUNT_TYPES, {
      error: (issue) =>
        issue.code === "invalid_value"
          ? "Please select a valid account type"
          : "Account type is required",
    })
    .optional(),
  subtype: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  bankName: z.string().max(200).optional(),
  maskedNumber: z
    .string()
    .regex(/^\d{1,4}$/, { error: "Input must be up to 4 digits" })
    .optional(),
  balance: z.number().optional(),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
});

export const accountsFilterSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  page: z.number().int().min(1).default(1),
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

export const accountsListAllSchema = z.object({
  search: z.string().optional(),
  type: z.array(z.enum(ACCOUNT_TYPES)).optional(),
  status: z.array(z.enum(ACCOUNT_STATUSES)).optional(),
  tags: z.array(z.string()).optional(),
  isManual: z.boolean().optional(),
});

export type AccountsListAllInput = z.infer<typeof accountsListAllSchema>;

export type BankAccount = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: AccountType;
  subtype: string | null;
  tags: string[];
  bankName: string | null;
  maskedNumber: string | null;
  balance: string | null;
  currency: string;
  isManual: boolean;
  status: AccountStatus | null;
  plaidItemId: string | null;
  plaidAccountId: string | null;
  monoAccountId: string | null;
  lastSyncedAt: Date | null;
};

export type PaginatedAccounts = PaginatedResult<BankAccount>;

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
