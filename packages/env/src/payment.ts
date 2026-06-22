import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv, authEnv } from "./server";

export const paymentServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...authEnv,
    PORT: z.coerce.number().default(4001),
    CORS_ORIGIN: z.url(),
    // Plaid
    PLAID_CLIENT_ID: z.string().min(1),
    PLAID_SECRET: z.string().min(1),
    PLAID_ENV: z.enum(["sandbox", "development", "production"]),
    // Mono (for African banks)
    MONO_SECRET_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
});
