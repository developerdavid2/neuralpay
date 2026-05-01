import type { Express, Request } from "express";
import proxy from "express-http-proxy";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { logger } from "../utils/logger";
import { requireAuth } from "../middleware/auth.middleware";

const proxyErrorHandler = (err: Error, res: any, _next: any) => {
  logger.error(`Proxy error: ${err.message}`);
  res.status(502).json({ success: false, message: "Service unavailable" });
};

// Injects the verified user id so downstream services can trust it
// ⚠️  Downstream services must NEVER trust x-user-id from external sources
//     Only trust it when Origin is the internal gateway
const withUserId = (proxyReqOpts: any, srcReq: Request) => {
  proxyReqOpts.headers = proxyReqOpts.headers ?? {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  proxyReqOpts.headers["x-user-id"] = (srcReq as any).user?.id ?? "";
  proxyReqOpts.headers["x-internal-source"] = "api-gateway";
  return proxyReqOpts;
};

const baseHeaders = (proxyReqOpts: any) => {
  proxyReqOpts.headers = proxyReqOpts.headers ?? {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  return proxyReqOpts;
};

export function mountProxies(app: Express) {
  // Handles: sign-up, sign-in, verify-otp, forgot-password, reset-password
  app.use(
    "/v1/auth",
    proxy(gatewayEnv.USER_SERVICE_URL, {
      proxyErrorHandler,
      proxyReqPathResolver: (req) => `/auth${req.url}`,
      proxyReqOptDecorator: baseHeaders,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info("Response from user-service /auth");
        return proxyResData;
      },
    }),
  );

  // ── Protected user routes → user-service ───────────────────────────────────
  app.use(
    "/v1/users",
    requireAuth,
    proxy(gatewayEnv.USER_SERVICE_URL, {
      proxyErrorHandler,
      proxyReqPathResolver: (req) => `/users${req.url}`,
      proxyReqOptDecorator: withUserId,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info("Response from user-service /users");
        return proxyResData;
      },
    }),
  );

  // ── Protected payment routes → payment-service ─────────────────────────────
  // app.use(
  //   "/v1/payments",
  //   requireAuth,
  //   proxy(gatewayEnv.PAYMENT_SERVICE_URL, {
  //     proxyErrorHandler,
  //     proxyReqPathResolver: (req) => `/payments${req.url}`,
  //     proxyReqOptDecorator: withUserId,
  //   }),
  // );

  // ── Protected AI routes → ai-service ───────────────────────────────────────
  // app.use(
  //   "/v1/ai",
  //   requireAuth,
  //   proxy(gatewayEnv.AI_SERVICE_URL, {
  //     proxyErrorHandler,
  //     proxyReqPathResolver: (req) => `/ai${req.url}`,
  //     proxyReqOptDecorator: withUserId,
  //   }),
  // );

  // ── Notification service websocket ─────────────────────────────────────────
  // Socket.io needs a different approach — not proxied via express-http-proxy
  // Frontend connects directly to notification-service or via a WS proxy
  // app.use("/v1/notifications", requireAuth, proxy(gatewayEnv.NOTIFICATION_SERVICE_URL, ...));
}
