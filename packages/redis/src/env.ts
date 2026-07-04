import { z } from "zod";

export const redisEnv = {
  REDIS_URL: z.string().url().min(1).default("redis://localhost:6379"),
};
