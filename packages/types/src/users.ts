import { z } from "zod";

export const userCreateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  planTier: z.string().default("free"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  planTier: z.string().default("free"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const newUserSchema = userCreateSchema;

export const updateUserSchema = userUpdateSchema
  .pick({
    name: true,
    image: true,
    phone: true,
  })
  .partial();

export type NewUserInput = z.infer<typeof newUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  planTier: string;
  createdAt: Date;
  updatedAt: Date;
};
