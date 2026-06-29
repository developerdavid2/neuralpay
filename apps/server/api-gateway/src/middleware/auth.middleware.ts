import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { logger } from "../utils/logger";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Always skip for auth routes — they handle their own auth
  if (req.path.startsWith("/v1/auth") || req.path.startsWith("/auth")) {
    return next();
  }

  try {
    const headers = fromNodeHeaders(req.headers);
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      // Inject user identity for downstream services
      req.headers["x-user-id"] = session.user.id;
      req.headers["x-user-email"] = session.user.email ?? "";
      req.headers["x-user-name"] = session.user.name ?? "";
      logger.info(`[auth] Session established for user: ${session.user.id}`);
    } else {
      logger.debug("[auth] No valid session — passing through unauthenticated");
      // ← Don't return 401 here — let downstream decide
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`[auth] Session extraction failed: ${errorMessage}`);
    // ← Don't return 401 here either — fail open, let downstream decide
  }

  next(); // always continue
}
