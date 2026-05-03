import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
  phone: z.string().min(5).max(20).nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<UserRecord, never>;
