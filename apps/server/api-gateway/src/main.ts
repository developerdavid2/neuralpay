// apps/server/api-gateway/src/main.ts
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
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "@neuralpay/api/context";
import { appRouter } from "@neuralpay/api/routers";

const PORT = Number(gatewayEnv.PORT) || 4000;
const app: Express = express();

app.use(helmet());
app.use(cors({ origin: [gatewayEnv.CORS_ORIGIN], credentials: true }));
app.use(morgan("dev"));
app.use(requestLogger);

// Better Auth — Polar webhooks only
app.use("/auth/polar", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", port: PORT });
});

console.log("appRouter loaded:", typeof appRouter);
console.log("createContext loaded:", typeof createContext);

// ── tRPC — mounted at /trpc ─────────────────────────────────────────────────
app.use(
  "/v1/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // only log server-side 5xx errors — not auth errors
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`tRPC error on ${path}:`, error);
      }
    },
  }),
);

mountProxies(app);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 api-gateway running on http://localhost:${PORT}`);
});

export { app };
