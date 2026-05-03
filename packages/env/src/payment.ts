import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv, authEnv } from "./server";

export const paymentServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...authEnv,
    PORT: z.coerce.number().default(4001),
    CORS_ORIGIN: z.url(),
  },
  runtimeEnv: process.env,
});
