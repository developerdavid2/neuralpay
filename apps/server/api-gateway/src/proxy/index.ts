import type { Express, Request, Response, NextFunction } from "express";
import proxy from "express-http-proxy";
import { createProxyMiddleware } from "http-proxy-middleware";
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

  // Inject session headers from req.user (attached by authMiddleware)
  const user = (srcReq as any).user;
  if (user?.id) {
    proxyReqOpts.headers["x-user-id"] = user.id;
    proxyReqOpts.headers["x-user-email"] = user.email ?? "";
    proxyReqOpts.headers["x-user-name"] = user.name ?? "";
  }

  // Forward the session cookie as fallback (belt and suspenders)
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
  const NAMESPACE_MAP: Record<string, string> = {
    users: gatewayEnv.USER_SERVICE_URL,
    payments: gatewayEnv.PAYMENT_SERVICE_URL,
    ai: gatewayEnv.AI_SERVICE_URL,
    notifications: gatewayEnv.NOTIFICATION_SERVICE_URL,
  };

  app.use("/v1/trpc", (req: Request, res: Response, next: NextFunction) => {
    // req.url here is e.g. "/users.profile.me" or "/users.profile.me,payments.accounts.list"
    const rawPath = req.url.split("?")[0]?.replace(/^\//, "") ?? "";

    // For batched calls the path looks like "users.profile.me,payments.accounts.list"
    // Take the first procedure to determine the namespace
    const firstProcedure = rawPath.split(",")[0] ?? "";
    const namespace = firstProcedure.split(".")[0] ?? "";

    const targetURL = NAMESPACE_MAP[namespace];

    if (!targetURL) {
      res.status(404).json({
        success: false,
        message: `Unknown tRPC namespace: "${namespace}"`,
      });
      return;
    }

    logger.info(`[tRPC proxy] ${req.method} ${namespace} → ${targetURL}`);

    proxy(targetURL, {
      proxyErrorHandler: proxyError,
      proxyReqPathResolver: (r) => {
        // Strip the namespace prefix from every procedure in the path
        // "users.profile.me"         → "profile.me"
        // "users.profile.me,users.profile.list" → "profile.me,profile.list"
        const url = new URL(`http://x${r.url}`);
        const stripped = url.pathname
          .replace(/^\//, "") // remove leading slash
          .split(",")
          .map((proc) =>
            proc.startsWith(`${namespace}.`)
              ? proc.slice(namespace.length + 1) // strip "users."
              : proc,
          )
          .join(",");

        const query = url.search; // preserve ?batch=1&input=... etc
        return `/trpc/${stripped}${query}`;
      },
      proxyReqOptDecorator: withUserId,
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info(`[tRPC proxy] response from ${namespace}-service`);
        return proxyResData;
      },
    })(req, res, next);
  });
}
// ── Mount all proxies ─────────────────────────────────────────────────────────
// In proxy.ts — add this separate export
export function mountStreamingProxy(app: Express) {
  app.use(
    "/v1/ai/chat/stream",
    createProxyMiddleware({
      target: gatewayEnv.AI_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (_path) => "/chat/stream", // always rewrite to exactly this
      on: {
        proxyReq: (proxyReq, req) => {
          proxyReq.setHeader("x-internal-source", "api-gateway");
          proxyReq.setHeader("cookie", (req as any).headers.cookie ?? "");
        },
        error: (err, _req, res) => {
          logger.error(`[stream proxy] error: ${err.message}`);
          (res as Response)
            .status(502)
            .json({ success: false, message: "AI service unavailable" });
        },
      },
    }),
  );
}

export function mountNotificationStreamProxy(app: Express) {
  app.use(
    "/v1/notifications/stream",
    createProxyMiddleware({
      target: gatewayEnv.NOTIFICATION_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: () => "/stream", // ← strip the /v1/notifications prefix
      on: {
        proxyReq: (proxyReq, req) => {
          proxyReq.setHeader("x-internal-source", "api-gateway");
          proxyReq.setHeader("cookie", (req as any).headers.cookie ?? "");
          const userId = (req as any).headers["x-user-id"];
          const userEmail = (req as any).headers["x-user-email"];
          if (userId) proxyReq.setHeader("x-user-id", userId);
          if (userEmail) proxyReq.setHeader("x-user-email", userEmail);
        },
        error: (err, _req, res) => {
          logger.error(`[notifications proxy] error: ${err.message}`);
          (res as Response)
            .status(502)
            .json({ error: "Notification service unavailable" });
        },
      },
    }),
  );
}

// And remove it from mountProxies
export function mountProxies(app: Express) {
  // 1. Better Auth routes → user-service
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
}
