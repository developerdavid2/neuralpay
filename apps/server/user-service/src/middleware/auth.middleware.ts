// src/middleware/auth.middleware.ts
import type { Response, NextFunction } from "express";
import type { RequestWithUser } from "../types";
import { auth } from "../lib/auth";

export async function requireAuth(
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });

  if (!session?.user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  // normalise undefined → null so types align
  req.user = {
    ...session.user,
    image: session.user.image ?? null,
  };

  next();
}
