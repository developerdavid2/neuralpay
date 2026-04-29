import { createAuth } from "@neuralpay/auth";
import { userServiceEnv } from "@neuralpay/env/user-service";

export const auth = createAuth({
  corsOrigin: userServiceEnv.CORS_ORIGIN,
  secret: userServiceEnv.BETTER_AUTH_SECRET,
  baseURL: userServiceEnv.BETTER_AUTH_URL,
});
