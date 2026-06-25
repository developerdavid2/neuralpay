// apps/api-gateway/src/main.ts

import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requestLogger } from "./middleware/logger.middleware";
import { authMiddleware } from "./middleware/auth.middleware";
import { mountProxies, mountStreamingProxy } from "./proxy";
import { errorHandler } from "./middleware/error.middleware";

const PORT = Number(gatewayEnv.PORT) || 4000;

const app = createExpressApp({
  serviceName: "api-gateway-service",
  port: PORT,
  allowedOrigins: [gatewayEnv.CORS_ORIGIN],
  beforeBodyParser: (app) => {
    // Keep stream route before body parser, but enforce auth first
    app.use("/chat/stream", authMiddleware);
    mountStreamingProxy(app);
  },
});

app.use(requestLogger);

// ── PUBLIC AUTH ROUTES — must be BEFORE authMiddleware ──
// These routes don't require an existing session
app.use("/auth/polar", toNodeHandler(auth));

// Mount proxy for /v1/auth BEFORE authMiddleware so it's public
mountProxies(app);

// ── PROTECTED ROUTES — authMiddleware applied after public routes ──
app.use(authMiddleware);

// Any additional protected routes go here

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 api-gateway-service running on http://localhost:${PORT}`);
});
