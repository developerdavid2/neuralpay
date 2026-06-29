import { createExpressApp } from "@neuralpay/config/express-config";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { authMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import {
  mountProxies,
  mountStreamingProxy,
  mountNotificationStreamProxy,
} from "./proxy";

const PORT = Number(gatewayEnv.PORT) || 4000;

const app = createExpressApp({
  serviceName: "api-gateway-service",
  port: PORT,
  allowedOrigins: [gatewayEnv.CORS_ORIGIN],
  beforeBodyParser: (app) => {
    // Streaming routes that need auth BEFORE body parser
    app.use("/v1/chat/stream", authMiddleware);
    mountStreamingProxy(app);

    // Notification SSE — same pattern
    app.use("/v1/notifications/stream", authMiddleware);
    mountNotificationStreamProxy(app);
  },
});

app.use(requestLogger);
app.use(authMiddleware); // For non-streaming protected routes
mountProxies(app);
app.use(errorHandler);

console.log("Routes:");

app.listen(PORT, () => {
  console.log(`🚀 api-gateway-service running on http://localhost:${PORT}`);
});
