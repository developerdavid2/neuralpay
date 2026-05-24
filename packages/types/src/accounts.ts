import { z } from "zod";

export const ACCOUNT_TYPE = [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
] as const;

export type AccountType = (typeof ACCOUNT_TYPE)[number];

// ── Accounts ──────────────────────────────────────────────────────────────────
export const createAccountSchema = z.object({
  name: z.string().min(1).max(200), // user-defined name
  type: z.enum(ACCOUNT_TYPE), // structural type
  subtype: z.string().max(100).optional(), // user label: "Ajo", "FD"
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

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
