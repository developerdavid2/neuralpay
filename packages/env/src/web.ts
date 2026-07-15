import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const webEnv = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    SERVER_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SERVER_URL: z.url(),
    NEXT_PUBLIC_AUTH_BASE_PATH: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_AUTH_BASE_PATH: process.env.NEXT_PUBLIC_AUTH_BASE_PATH,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    SERVER_URL: process.env.SERVER_URL,
  },
});
