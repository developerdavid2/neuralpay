import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4001";
const basePath = process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? "/auth";

export const authClient = createAuthClient({
  baseURL,
  basePath,
  plugins: [emailOTPClient()],
});
