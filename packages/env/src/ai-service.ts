import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { baseServerEnv } from "./server";

export const aiServiceEnv = createEnv({
  server: {
    ...baseServerEnv,
    PORT: z.coerce.number().default(4003),
    OPENAI_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
