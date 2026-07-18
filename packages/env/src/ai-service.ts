import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv } from "./server";

export const aiServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    PORT: z.coerce.number().default(4003),
    GROQ_API_KEY: z.string().min(1),
    AI_PROVIDER: z.string().default("groq"),
    AI_MODEL: z.string().default("llama-3.3-70b-versatile"),
    DATABASE_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
