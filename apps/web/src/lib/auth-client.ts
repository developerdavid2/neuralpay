import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@neuralpay/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000",
  basePath: process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? "/v1/auth",
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
