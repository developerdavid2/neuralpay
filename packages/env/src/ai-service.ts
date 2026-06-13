import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { authEnv, baseServerEnv } from "./server";

export const aiServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    ...authEnv,
    PORT: z.coerce.number().default(4003),
    GROQ_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
