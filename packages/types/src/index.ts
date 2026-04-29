import { z } from "zod";
import type {
  userSelectSchema,
  userInsertSchema,
  userUpdateSchema,
} from "@neuralpay/db";

export type User = z.infer<typeof userSelectSchema>;
export type NewUser = z.infer<typeof userInsertSchema>;
export type UpdateUser = z.infer<typeof userUpdateSchema>;
// export const UserSchema = z.object({
//   id: z.string(),
//   email: z.email(),
//   name: z.string(),
//   avatarUrl: z.string().url().nullable(),
//   tier: z.enum(["free", "pro", "team"]),
//   createdAt: z.coerce.date(),
// });

// export const TransactionSchema = z.object({
//   id: z.string(),
//   accountId: z.string(),
//   userId: z.string(),
//   amount: z.number(),
//   currency: z.string(),
//   category: z.string(),
//   merchant: z.string(),
//   date: z.coerce.date(),
//   isAnomaly: z.boolean(),
//   anomalyScore: z.number().optional(),
// });

// export const AccountSchema = z.object({
//   id: z.string(),
//   userId: z.string(),
//   name: z.string(),
//   type: z.enum(["checking", "savings", "credit"]),
//   balance: z.number(),
//   currency: z.string(),
// });

// export const VaultSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   goalAmount: z.number(),
//   currency: z.string(),
//   creatorId: z.string(),
//   status: z.enum(["active", "completed"]),
//   currentAmount: z.number(),
// });

// export const SplitSchema = z.object({
//   id: z.string(),
//   title: z.string(),
//   totalAmount: z.number(),
//   currency: z.string(),
//   creatorId: z.string(),
//   status: z.enum(["open", "settled"]),
// });

// export const NotificationSchema = z.object({
//   id: z.string(),
//   userId: z.string(),
//   type: z.string(),
//   title: z.string(),
//   body: z.string(),
//   read: z.boolean(),
//   createdAt: z.coerce.date(),
// });

// export type Transaction = z.infer<typeof TransactionSchema>;
// export type Account = z.infer<typeof AccountSchema>;
// export type Vault = z.infer<typeof VaultSchema>;
// export type Split = z.infer<typeof SplitSchema>;
// export type Notification = z.infer<typeof NotificationSchema>;

export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
