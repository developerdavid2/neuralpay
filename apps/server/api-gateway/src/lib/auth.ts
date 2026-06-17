import { createAuth } from "@neuralpay/auth";
import { gatewayEnv } from "@neuralpay/env/gateway";

export const auth = createAuth({
  corsOrigin: gatewayEnv.CORS_ORIGIN,
  secret: gatewayEnv.BETTER_AUTH_SECRET,
  baseURL: gatewayEnv.BETTER_AUTH_URL,
  google:
    gatewayEnv.GOOGLE_CLIENT_ID && gatewayEnv.GOOGLE_CLIENT_SECRET
      ? {
          clientId: gatewayEnv.GOOGLE_CLIENT_ID,
          clientSecret: gatewayEnv.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
});
