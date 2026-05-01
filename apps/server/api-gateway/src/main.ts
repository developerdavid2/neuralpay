// apps/server/api-gateway/src/index.ts
import { gatewayEnv } from "@neuralpay/env/gateway";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { mountProxies } from "./proxy";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const PORT = Number(gatewayEnv.PORT) || 4000;
const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: [gatewayEnv.CORS_ORIGIN],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(requestLogger);

// ⚠️  Gateway only mounts auth for Polar-specific routes (webhooks, portal)
// All sign-in/sign-up/OTP routes are proxied to user-service via /v1/auth
app.use("/auth/polar", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", port: PORT });
});

mountProxies(app);

// Global error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 api-gateway running on http://localhost:${PORT}`);
});

export { app };
