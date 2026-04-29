import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  if (!session) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // Attach user to request for downstream services
  (req as any).user = session.user;
  (req as any).session = session.session;
  next();
}
