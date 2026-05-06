import { createExpressApp } from "@neuralpay/config/express-config";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requestLogger } from "./middleware/logger.middleware";
import { mountProxies } from "./proxy";
import { errorHandler } from "./middleware/error.middleware";

const PORT = Number(gatewayEnv.PORT) || 4000;
const app = createExpressApp({
  serviceName: "api-gateway-service",
  port: PORT,
  allowedOrigins: [gatewayEnv.CORS_ORIGIN],
});

app.use(requestLogger);
// Polar webhook only — gateway-local Better Auth instance
app.use("/auth/polar", toNodeHandler(auth));

// // ── All routing — gateway knows nothing about business logic ──────────────
mountProxies(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 api-gateway-service running on http://localhost:${PORT}`);
});
