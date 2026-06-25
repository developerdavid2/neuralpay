// apps/api-gateway/src/main.ts

import { createExpressApp } from "@neuralpay/config/express-config";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { authMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { mountProxies, mountStreamingProxy } from "./proxy";
import { logger } from "./utils/logger";
import {
  authRateLimit,
  globalRateLimit,
  plaidRateLimit,
} from "./middleware/rate-limt.middleware";

const PORT = Number(gatewayEnv.PORT) || 4000;

const app = createExpressApp({
  serviceName: "api-gateway-service",
  port: PORT,
  allowedOrigins: [gatewayEnv.CORS_ORIGIN],
  beforeBodyParser: (app) => {
    app.use("/v1/chat/stream", authMiddleware);
    mountStreamingProxy(app);
  },
});

app.use(requestLogger);

// Rate Limiting applied before proxying
app.use(globalRateLimit);
app.use("/v1/auth", authRateLimit);
app.use("/v1/trpc/payments.plaid", plaidRateLimit);

// Proxies
mountProxies(app);

app.use(authMiddleware);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Api-gateway-service running on http://localhost:${PORT}`);
  logger.info(`User-service running on ${gatewayEnv.USER_SERVICE_URL}`);
  logger.info(`AI-service running on ${gatewayEnv.AI_SERVICE_URL}`);
  logger.info(`Payment-service running on ${gatewayEnv.PAYMENT_SERVICE_URL}`);
  logger.info(
    `Notification-service running on ${gatewayEnv.NOTIFICATION_SERVICE_URL}`,
  );
});
