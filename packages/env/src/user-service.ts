import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv, authEnv } from "./server";

export const userServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...authEnv,
    PORT: z.coerce.number().default(4001),
    CORS_ORIGIN: z.url(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.email(),
    SMTP_PASS: z.string().min(1),
  },
  runtimeEnv: process.env,
});
