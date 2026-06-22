import { z } from "zod";

export const exchangePublicTokenSchema = z.object({
  publicToken: z.string(),
});

export type ExchangePublicTokenInput = z.infer<
  typeof exchangePublicTokenSchema
>;
export const connectedPlaidBankInternalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accessToken: z.string(),
  itemId: z.string().nullable(),
  institutionName: z.string().nullable(),
  transactionCursor: z.string().nullable(),
  institutionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const connectedPlaidBankSchema = connectedPlaidBankInternalSchema.omit({
  accessToken: true,
  transactionCursor: true,
});

export type ConnectedPlaidBankInternal = z.infer<
  typeof connectedPlaidBankInternalSchema
>;
export type ConnectedPlaidBank = z.infer<typeof connectedPlaidBankSchema>;
