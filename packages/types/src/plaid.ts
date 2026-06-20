import { z } from "zod";

export const exchangePublicTokenSchema = z.object({
  publicToken: z.string(),
});

export type ExchangePublicTokenInput = z.infer<
  typeof exchangePublicTokenSchema
>;

export const connectedPlaidBankSchema = z.object({
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

export type ConnectedPlaidBank = z.infer<typeof connectedPlaidBankSchema>;
