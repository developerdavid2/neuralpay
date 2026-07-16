import { createAuth } from "@neuralpay/auth";
import { userServiceEnv } from "@neuralpay/env/user-service";

export const auth = createAuth({
  secret: userServiceEnv.BETTER_AUTH_SECRET,
  baseURL: userServiceEnv.AUTH_PUBLIC_URL,
  google:
    userServiceEnv.GOOGLE_CLIENT_ID && userServiceEnv.GOOGLE_CLIENT_SECRET
      ? {
          clientId: userServiceEnv.GOOGLE_CLIENT_ID,
          clientSecret: userServiceEnv.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
});
