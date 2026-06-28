import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { logger } from "../utils/logger";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip auth for public better-auth routes
  if (req.path.startsWith("/auth")) {
    return next();
  }

  try {
    const headers = fromNodeHeaders(req.headers);
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      // Attach to req for any direct gateway use
      (req as any).user = session.user;

      // ── CRITICAL: Set headers so proxy forwards them to services ──
      req.headers["x-user-id"] = session.user.id;
      req.headers["x-user-email"] = session.user.email ?? "";
      req.headers["x-user-name"] = session.user.name ?? "";

      logger.info(`[auth] Session established for user: ${session.user.id}`);
    } else {
      logger.debug("[auth] No valid session found");
      // For protected routes, block. Remove this if you have public proxies too.
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`[auth] Failed to extract session: ${errorMessage}`);
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
