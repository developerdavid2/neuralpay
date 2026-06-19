import { z } from "zod";

export const exchangePublicTokenSchema = z.object({
  publicToken: z.string(),
});

export type ExchangePublicTokenInput = z.infer<
  typeof exchangePublicTokenSchema
>;

export const connectedBankSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accessToken: z.string(),
  itemId: z.string().optional(),
  institutionName: z.string().optional(),
  institutionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ConnectedBank = z.infer<typeof connectedBankSchema>;
