import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv } from "./server";

export const notificationsServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    PORT: z.coerce.number().default(4004),
    FCM_SERVICE_ACCOUNT: z.string().min(1),
    REDIS_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
});
