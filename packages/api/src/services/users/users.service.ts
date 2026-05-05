import { db } from "@neuralpay/db";
import { user, type UserRecord } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";
import {
  updateUserSchema,
  type ServiceResult,
  type UpdateUserInput,
} from "@neuralpay/types";

export const UsersService = {
  async getById(id: string): Promise<ServiceResult<UserRecord>> {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      if (!result[0]) {
        return { success: false, error: "User not found", code: "NOT_FOUND" };
      }
      return { success: true, data: result[0] };
    } catch (err) {
      console.error("[UsersService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch user",
        code: "DB_ERROR",
      };
    }
  },

  async getAllUsers(): Promise<ServiceResult<UserRecord[]>> {
    try {
      const result = await db.select().from(user);

      return { success: true, data: result };
    } catch (err) {
      console.error("[UsersService.getAllUsers]", err);
      return {
        success: false,
        error: "Failed to fetch users",
        code: "DB_ERROR",
      };
    }
  },

  async updatePlanTier(
    id: string,
    planTier: "free" | "pro" | "team",
  ): Promise<ServiceResult<UserRecord>> {
    try {
      const result = await db
        .update(user)
        .set({ planTier, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();

      if (!result[0]) {
        return { success: false, error: "User not found", code: "NOT_FOUND" };
      }
      return { success: true, data: result[0] };
    } catch (err) {
      console.error("[UsersService.updatePlanTier]", err);
      return {
        success: false,
        error: "Failed to update plan",
        code: "DB_ERROR",
      };
    }
  },
} as const;

export { updateUserSchema };
export type { UpdateUserInput, UserRecord };
