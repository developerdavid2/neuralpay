import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@neuralpay/auth";
import { webEnv } from "@neuralpay/env/web";

export const authClient = createAuthClient({
  baseURL: webEnv.NEXT_PUBLIC_SERVER_URL,
  basePath: webEnv.NEXT_PUBLIC_AUTH_BASE_PATH,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
