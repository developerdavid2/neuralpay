import { z } from "zod";

export const dbEnv = {
  DATABASE_URL: z.url().min(1),
};
