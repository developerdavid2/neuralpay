import type { Express, Request, Response, NextFunction } from "express";
import proxy from "express-http-proxy";
import { createProxyMiddleware } from "http-proxy-middleware";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { logger } from "../utils/logger";

// ── Error handler
const proxyError = (err: Error, res: any, _next: any) => {
  logger.error(`Proxy error: ${err.message}`);
  res.status(502).json({ success: false, message: "Service unavailable" });
};

// ── Header decorators
// Used for protected routes — injects verified user id so downstream
const withUserId = (proxyReqOpts: any, srcReq: Request) => {
  proxyReqOpts.headers ??= {};
  proxyReqOpts.headers["content-type"] = "application/json";
  proxyReqOpts.headers["origin"] = gatewayEnv.TRUSTED_ORIGINS;
  proxyReqOpts.headers["x-internal-source"] = "api-gateway";

  // Enforce lowercase lookups for proxy mapping safety
  const userId = srcReq.headers["x-user-id"] || (srcReq as any).user?.id;
  const userEmail =
    srcReq.headers["x-user-email"] || (srcReq as any).user?.email;
  const userName = srcReq.headers["x-user-name"] || (srcReq as any).user?.name;
  const planTier =
    srcReq.headers["x-user-plan-tier"] || (srcReq as any).user?.planTier;

  if (userId) proxyReqOpts.headers["x-user-id"] = String(userId);
  if (userEmail) proxyReqOpts.headers["x-user-email"] = String(userEmail);
  if (userName) proxyReqOpts.headers["x-user-name"] = String(userName);
  if (planTier) proxyReqOpts.headers["x-user-plan-tier"] = String(planTier);

  // Ensure cookies are correctly passed down so Better Auth fallback works
  proxyReqOpts.headers["cookie"] = srcReq.headers.cookie ?? "";

  // Forward original host information so downstream Better Auth doesn't fail origin check
  proxyReqOpts.headers["x-forwarded-host"] =
    srcReq.headers["x-forwarded-host"] || srcReq.headers["host"] || "";
  proxyReqOpts.headers["x-forwarded-proto"] =
    srcReq.headers["x-forwarded-proto"] || "https";

  return proxyReqOpts;
};

// ── tRPC namespace router
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

        const query = url.search;
        return `/trpc/${stripped}${query}`;
      },
      proxyReqOptDecorator: withUserId,
      userResHeaderDecorator: (
        headers,
        _userReq,
        _userRes,
        _proxyReq,
        proxyRes,
      ) => {
        const setCookie = proxyRes.headers["set-cookie"];
        if (setCookie) {
          headers["set-cookie"] = setCookie;
        }
        return headers;
      },
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info(`[tRPC proxy] response from ${namespace}-service`);
        return proxyResData;
      },
    })(req, res, next);
  });
}

// ── Mount all proxies
export function mountStreamingProxy(app: Express) {
  app.use(
    "/v1/ai/chat/stream",
    createProxyMiddleware({
      target: gatewayEnv.AI_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (_path) => "/chat/stream",
      on: {
        proxyReq: (proxyReq, req) => {
          proxyReq.setHeader("x-internal-source", "api-gateway");
          proxyReq.setHeader("cookie", (req as any).headers.cookie ?? "");

          const userId = (req as any).headers["x-user-id"];
          const userEmail = (req as any).headers["x-user-email"];
          const userName = (req as any).headers["x-user-name"];
          if (userId) proxyReq.setHeader("x-user-id", userId);
          if (userEmail) proxyReq.setHeader("x-user-email", userEmail);
          if (userName) proxyReq.setHeader("x-user-name", userName);
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
      pathRewrite: () => "/stream",
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

export function mountUploadThingProxy(app: Express) {
  app.use(
    "/v1/uploadthing",
    createProxyMiddleware({
      target: gatewayEnv.USER_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path) => {
        const [, query] = path.split("?");
        return `/api/uploadthing${query ? `?${query}` : ""}`;
      },
      on: {
        error: (err, _req, res) => {
          logger.error(`[uploadthing proxy] error: ${err.message}`);
          (res as Response)
            .status(502)
            .json({ success: false, message: "Upload service unavailable" });
        },
      },
    }),
  );
}
// And remove it from mountProxies
export function mountProxies(app: Express) {
  // 1. Better Auth routes → user-service
  // In mountProxies — auth proxy
  app.use(
    "/v1/auth",
    proxy(gatewayEnv.USER_SERVICE_URL, {
      proxyErrorHandler: proxyError,
      proxyReqPathResolver: (req) => `/api/auth${req.url}`,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers ??= {};
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-internal-source"] = "api-gateway";
        proxyReqOpts.headers["x-forwarded-host"] =
          srcReq.headers["x-forwarded-host"] ?? srcReq.headers["host"] ?? "";
        proxyReqOpts.headers["x-forwarded-proto"] =
          (srcReq.headers["x-forwarded-proto"] as string) ?? "https";
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie ?? "";
        return proxyReqOpts;
      },

      userResHeaderDecorator: (
        headers,
        _userReq,
        _userRes,
        _proxyReq,
        proxyRes,
      ) => {
        const setCookie = proxyRes.headers["set-cookie"];
        if (setCookie) {
          headers["set-cookie"] = setCookie;
        }
        return headers;
      },
      userResDecorator: (_proxyRes, proxyResData) => {
        logger.info("[proxy] response from user-service /auth");
        return proxyResData;
      },
    }),
  );

  // 2. tRPC routes → namespaced to correct service
  trpcNamespaceProxy(app);
}
