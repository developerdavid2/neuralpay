import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv, authEnv } from "./server";

export const gatewayEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...authEnv,
    PORT: z.coerce.number().default(4000),
    CORS_ORIGIN: z.string().url(),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_SUCCESS_URL: z.string().url(),
    USER_SERVICE_URL: z.string().url(),
    REDIS_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
});
