import { createAuth } from "@neuralpay/auth";
import { gatewayEnv } from "@neuralpay/env/gateway";

export const auth = createAuth({
  corsOrigin: gatewayEnv.CORS_ORIGIN,
  secret: gatewayEnv.BETTER_AUTH_SECRET,
  baseURL: gatewayEnv.BETTER_AUTH_URL,
  polar: {
    accessToken: gatewayEnv.POLAR_ACCESS_TOKEN,
    successUrl: gatewayEnv.POLAR_SUCCESS_URL,
  },
});
