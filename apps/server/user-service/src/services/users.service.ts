import { db } from "@neuralpay/db";
import { user } from "@neuralpay/db/schema";
import type {
  ServiceResult,
  UpdateProfileInput,
  UserRecord,
} from "@neuralpay/types";
import { eq } from "drizzle-orm";

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
      return { success: true, data: result[0] as UserRecord };
    } catch (err) {
      console.error("[UsersService.getById]", err);
      return {
        success: false,
        error: "Failed to fetch user",
        code: "DB_ERROR",
      };
    }
  },

  async updateProfile(
    id: string,
    input: UpdateProfileInput,
  ): Promise<ServiceResult<UserRecord>> {
    try {
      const result = await db
        .update(user)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning();

      if (!result[0]) {
        return { success: false, error: "User not found", code: "NOT_FOUND" };
      }
      return { success: true, data: result[0] as UserRecord };
    } catch (err) {
      console.error("[UsersService.updateProfile]", err);
      return {
        success: false,
        error: "Failed to update profile",
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
      return { success: true, data: result[0] as UserRecord };
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
