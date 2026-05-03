import { db } from "@neuralpay/db";
import { user } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

export type UserRecord = typeof user.$inferSelect;

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

  async update(
    id: string,
    data: UpdateUserInput,
  ): Promise<ServiceResult<UserRecord>> {
    try {
      const result = await db
        .update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();

      if (!result[0]) {
        return { success: false, error: "User not found", code: "NOT_FOUND" };
      }
      return { success: true, data: result[0] };
    } catch (err) {
      console.error("[UsersService.update]", err);
      return {
        success: false,
        error: "Failed to update user",
        code: "DB_ERROR",
      };
    }
  },
} as const;
