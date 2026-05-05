import type { Express, Request, Response, NextFunction } from "express";
import proxy from "express-http-proxy";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { logger } from "../utils/logger";

// ── Error handler ─────────────────────────────────────────────────────────────
const proxyError = (err: Error, res: any, _next: any) => {
  logger.error(`Proxy error: ${err.message}`);
  res.status(502).json({ success: false, message: "Service unavailable" });
};

// ── Header decorators ─────────────────────────────────────────────────────────
// Used for public routes (auth) — no user identity injected
const baseHeaders = (proxyReqOpts: any) => {
  proxyReqOpts.headers ??= {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  proxyReqOpts.headers["x-internal-source"] = "api-gateway";
  return proxyReqOpts;
};

// Used for protected routes — injects verified user id so downstream

const withUserId = (proxyReqOpts: any, srcReq: Request) => {
  proxyReqOpts.headers ??= {};
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
  proxyReqOpts.headers["x-internal-source"] = "api-gateway";
  proxyReqOpts.headers["x-user-id"] = (srcReq as any).user?.id ?? "";
  // Forward the session cookie so each service can also run auth.api.getSession
  // if it needs to (belt and suspenders)
  proxyReqOpts.headers["cookie"] = srcReq.headers.cookie ?? "";
  return proxyReqOpts;
};

// ── tRPC namespace router ─────────────────────────────────────────────────────
// tRPC procedure names are dot-separated: "users.profile.me", "payments.transactions.list"
// The first segment is the namespace — use it to route to the correct service.
//
// Batched requests: tRPC can send multiple procedures in one HTTP call
// e.g. POST /v1/trpc/users.profile.me,payments.accounts.list
// We don't split batches — each service receives the full batch path.
// Cross-service batches are rare; if needed, add a batch-splitter middleware.

function trpcNamespaceProxy(app: Express) {
  // Map first segment → service URL
  const NAMESPACE_MAP: Record<string, string> = {
    users: gatewayEnv.USER_SERVICE_URL,
    payments: gatewayEnv.PAYMENT_SERVICE_URL,
    ai: gatewayEnv.AI_SERVICE_URL,
    notifications: gatewayEnv.NOTIFICATION_SERVICE_URL,
  };

  // Middleware that reads the namespace and proxies to the right service
  app.use("/v1/trpc", (req: Request, res: Response, next: NextFunction) => {
    const segment = req.path.split("/")[1] ?? "";
    const namespace = segment.split(".")[0];

    const targetURL = NAMESPACE_MAP[namespace as string];

    if (!targetURL) {
      res.status(404).json({
        success: false,
        message: `Unknown tRPC namespace: "${namespace}"`,
      });
      return;
    }

    logger.info(`[tRPC proxy] ${req.method} ${namespace} → ${targetURL}`);

    // Proxy to the service — path stays the same (/v1/trpc/users.profile.me)
    // Each service mounts tRPC at /trpc, so we strip the /v1 prefix
    proxy(targetURL, {
      proxyErrorHandler: proxyError,
      proxyReqPathResolver: (r) => `/trpc${r.url}`,
      proxyReqOptDecorator: withUserId,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info(`[tRPC proxy] response from ${namespace}-service`);
        return proxyResData;
      },
    })(req, res, next);
  });
}

// ── Mount all proxies ─────────────────────────────────────────────────────────
export function mountProxies(app: Express) {
  // 1. Better Auth routes → user-service
  //    Handles: sign-up, sign-in, OTP, forgot-password, reset-password
  //    Better Auth client on frontend calls these directly, no tRPC involved
  app.use(
    "/v1/auth",
    proxy(gatewayEnv.USER_SERVICE_URL, {
      proxyErrorHandler: proxyError,
      proxyReqPathResolver: (req) => `/auth${req.url}`,
      proxyReqOptDecorator: baseHeaders,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info("[proxy] response from user-service /auth");
        return proxyResData;
      },
    }),
  );

  // 2. tRPC routes → namespaced to correct service
  trpcNamespaceProxy(app);

  // 3. Plaid/Mono webhooks → payment-service (external inbound)
  // app.use(
  //   "/v1/webhooks",
  //   proxy(gatewayEnv.PAYMENT_SERVICE_URL, {
  //     proxyErrorHandler:    proxyError,
  //     proxyReqPathResolver: (req) => `/webhooks${req.url}`,
  //     proxyReqOptDecorator: baseHeaders,
  //   }),
  // );

  // 4. Socket.io (notification-service) — NOT proxied here
  //    Frontend connects directly: io("http://localhost:4004")
  //    because WebSocket upgrade through express-http-proxy is unreliable
}
