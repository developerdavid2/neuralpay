import type { Express } from "express";
import proxy from "express-http-proxy";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { logger } from "../utils/logger";
import { requireAuth } from "../middleware/auth.middleware";

const proxyOptions = {
  proxyErrorHandler: (err: any, res: any, next: any) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(502).json({ success: false, message: "Service unavailable" });
  },
};

export function mountProxies(app: Express) {
  // User service — public auth routes (no auth required)
  app.use(
    "/v1/auth",
    proxy(gatewayEnv.USER_SERVICE_URL, {
      ...proxyOptions,
      proxyReqPathResolver: (req) => `/auth${req.url}`,
      proxyReqOptDecorator: (proxyReqOpts) => {
        proxyReqOpts.headers = proxyReqOpts.headers ?? {};
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["Origin"] = gatewayEnv.CORS_ORIGIN;
        return proxyReqOpts;
      },
      userResDecorator: (
        _proxyRes: any,
        proxyResData: any,
        _userReq: any,
        _userRes: any,
      ) => {
        logger.info(`Response from user-service`);
        return proxyResData;
      },
    }),
  );

  // User service — protected user routes
  app.use(
    "/v1/users",
    requireAuth,
    proxy(gatewayEnv.USER_SERVICE_URL, {
      ...proxyOptions,
      proxyReqPathResolver: (req) => `/users${req.url}`,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers = proxyReqOpts.headers ?? {};
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-user-id"] = (srcReq as any).user.id;
        return proxyReqOpts;
      },
      userResDecorator: (_proxyRes: any, proxyResData: any) => {
        logger.info(`Response from user-service /users`);
        return proxyResData;
      },
    }),
  );

  // AI service — protected
  //   app.use(
  //     "/v1/ai",
  //     requireAuth,
  //     proxy(gatewayEnv.AI_SERVICE_URL, {
  //       ...proxyOptions,
  //       proxyReqPathResolver: (req) => `/ai${req.url}`,
  //       proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  //         proxyReqOpts.headers = proxyReqOpts.headers ?? {};
  //         proxyReqOpts.headers["Content-Type"] = "application/json";
  //         proxyReqOpts.headers["x-user-id"] = (srcReq as any).user.id;
  //         return proxyReqOpts;
  //       },
  //       userResDecorator: (_proxyRes: any, proxyResData: any) => {
  //         logger.info(`Response from ai-service`);
  //         return proxyResData;
  //       },
  //     }),
  //   );
}
