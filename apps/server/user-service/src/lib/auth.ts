import { createAuth } from "@neuralpay/auth";
import { userServiceEnv } from "@neuralpay/env/user-service";

export const auth = createAuth({
  corsOrigin: userServiceEnv.CORS_ORIGIN,
  secret: userServiceEnv.BETTER_AUTH_SECRET,
  baseURL: userServiceEnv.BETTER_AUTH_URL,
  google:
    userServiceEnv.GOOGLE_CLIENT_ID && userServiceEnv.GOOGLE_CLIENT_SECRET
      ? {
          clientId: userServiceEnv.GOOGLE_CLIENT_ID,
          clientSecret: userServiceEnv.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
});
