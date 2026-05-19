import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    // Extract session from headers using better-auth
    const headers = fromNodeHeaders(req.headers);
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      // Attach user to request object so proxy decorators can access it
      (req as any).user = session.user;
    }
  } catch (error) {
    // Non-critical — if auth fails, we just don't attach user
    // Services can still try cookie-based auth as fallback
    console.error("Internal Server error", error);
  }

  next();
}
