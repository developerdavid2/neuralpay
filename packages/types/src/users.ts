import { userInsertSchema, userUpdateSchema } from "@neuralpay/db/schema";
import { z } from "zod";

export const updateUserSchema = userUpdateSchema
  .pick({
    name: true,
    image: true,
    phone: true,
  })
  .partial();

export type NewUserInput = z.infer<typeof userInsertSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type { UserRecord } from "@neuralpay/db/schema";
