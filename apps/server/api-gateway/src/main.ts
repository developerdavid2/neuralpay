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

// Better Auth — gateway handles its own auth too (Polar etc.)
app.use("/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", port: PORT });
});

// All proxied routes
mountProxies(app);

// Global error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 api-gateway running on http://localhost:${PORT}`);
});

export { app };
