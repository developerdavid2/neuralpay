import { redisEnv } from "@neuralpay/redis/client";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv } from "./server";

export const gatewayEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...redisEnv,
    PORT: z.coerce.number().default(4000),
    CORS_ORIGIN: z.url(),
    USER_SERVICE_URL: z.url(),
    PAYMENT_SERVICE_URL: z.url(),
    AI_SERVICE_URL: z.url(),
    NOTIFICATION_SERVICE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
