import { gatewayEnv } from "@neuralpay/env/gateway";
import type { Express, Request } from "express";
import proxy from "express-http-proxy";
import { logger } from "../utils/logger";

const proxyError = (err: Error, res: any, _next: any) => {
  logger.error(`Proxy error: ${err.message}`);
  res.status(502).json({ success: false, message: "Service unavailable" });
};

const withUserId = (proxyReqOpts: any, srcReq: Request) => {
  proxyReqOpts.headers ??= {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  proxyReqOpts.headers["x-user-id"] = (srcReq as any).user?.id ?? "";
  proxyReqOpts.headers["x-internal-source"] = "api-gateway";
  return proxyReqOpts;
};

const baseHeaders = (proxyReqOpts: any) => {
  proxyReqOpts.headers ??= {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  return proxyReqOpts;
};

export function mountProxies(app: Express) {
  // ── Auth → user-service (/auth/* → user-service /auth/*)
  // Handles: sign-up, sign-in, verify-otp, forgot-password, reset-password
  app.use(
    "/v1/auth",
    proxy(gatewayEnv.USER_SERVICE_URL, {
      proxyErrorHandler: proxyError,
      proxyReqPathResolver: (req) => `/auth${req.url}`,
      proxyReqOptDecorator: baseHeaders,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info("Response from user-service /auth");
        return proxyResData;
      },
    }),
  );

  // ── Payment webhooks → payment-service ────────────────────────────────────
  // app.use(
  //   "/v1/webhooks",
  //   proxy(gatewayEnv.PAYMENT_SERVICE_URL, {
  //     proxyErrorHandler:    proxyError,
  //     proxyReqPathResolver: (req) => `/webhooks${req.url}`,
  //     proxyReqOptDecorator: baseHeaders,
  //   }),
  // );

  // ── Notification websocket ─────────────────────────────────────────────────
  // Socket.io connects directly to notification-service — not proxied here.
  // Frontend: io("http://localhost:4004") with auth token in handshake.
}
