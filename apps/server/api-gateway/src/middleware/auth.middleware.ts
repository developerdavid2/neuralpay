import { getCachedSession, setCachedSession } from "@/lib/session-cache";
import { gatewayEnv } from "@neuralpay/env/gateway";
import type { NextFunction, Request, Response } from "express";

interface SessionResponse {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    planTier?: string | null;
  };
}

export async function authMiddleware(
  req: Request,
  _: Response,
  next: NextFunction,
) {
  if (req.path.startsWith("/v1/auth") || req.path.startsWith("/auth")) {
    return next();
  }

  const cookie = req.headers.cookie;
  if (!cookie) {
    return next();
  }

  try {
    const cached = await getCachedSession(cookie);
    if (cached) {
      attachUserHeaders(req, cached);
      return next();
    }

    const sessionRes = await fetch(
      `${gatewayEnv.USER_SERVICE_URL}/auth/get-session`,
      { headers: { cookie } },
    );

    if (!sessionRes.ok) {
      return next();
    }

    const session = (await sessionRes.json()) as SessionResponse | null;

    if (session?.user) {
      attachUserHeaders(req, session);
      await setCachedSession(cookie, session);
    }
  } catch (error) {}

  next();
}

function attachUserHeaders(req: Request, session: SessionResponse) {
  req.headers["x-user-id"] = session.user.id;
  req.headers["x-user-email"] = session.user.email ?? "";
  req.headers["x-user-name"] = session.user.name ?? "";
  req.headers["x-user-plan-tier"] = session.user.planTier ?? "free";
}
