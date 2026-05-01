import type { userInsertSchema, userUpdateSchema } from "@neuralpay/db";
import { z } from "zod";
export * from "./auth";
export {};

export type NewUser = z.infer<typeof userInsertSchema>;
export type UpdateUser = z.infer<typeof userUpdateSchema>;

export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
