// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4001",
  basePath: "/auth",
  plugins: [emailOTPClient()],
});
