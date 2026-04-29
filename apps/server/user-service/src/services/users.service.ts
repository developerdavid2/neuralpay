import { db } from "../db";
import { user } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";
import type { ServiceResponse, UpdateUser, User } from "@neuralpay/types";

export const UsersService = {
  async getById(id: string): Promise<ServiceResponse<User>> {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1);

    if (!result[0]) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: result[0] };
  },

  async update(id: string, data: UpdateUser): Promise<ServiceResponse<User>> {
    const result = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    if (!result[0]) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: result[0] };
  },
};
