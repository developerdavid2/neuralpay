import { getCachedSession, setCachedSession } from "@/lib/session-cache";
import { gatewayEnv } from "@neuralpay/env/gateway";
import type { NextFunction, Request, Response } from "express";

interface SessionResponse {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(`[authMiddleware] hit: ${req.method} ${req.path}`); // ← temp debug

  if (req.path.startsWith("/v1/auth") || req.path.startsWith("/auth")) {
    return next();
  }

  const cookie = req.headers.cookie;
  if (!cookie) {
    console.log("[authMiddleware] no cookie present"); // ← temp debug
    return next();
  }

  try {
    const cached = await getCachedSession(cookie);
    if (cached) {
      console.log("[authMiddleware] cache hit, user:", cached.user?.id); // ← temp debug
      attachUserHeaders(req, cached);
      return next();
    }

    const sessionRes = await fetch(
      `${gatewayEnv.USER_SERVICE_URL}/auth/get-session`,
      { headers: { cookie } },
    );

    console.log(
      "[authMiddleware] user-service response status:",
      sessionRes.status,
    ); // ← temp debug

    if (!sessionRes.ok) {
      return next();
    }

    const session = (await sessionRes.json()) as SessionResponse | null;
    console.log("[authMiddleware] session:", session); // ← temp debug

    if (session?.user) {
      attachUserHeaders(req, session);
      await setCachedSession(cookie, session);
    }
  } catch (error) {
    console.log("[authMiddleware] error:", error); // ← temp debug
  }

  next();
}

function attachUserHeaders(req: Request, session: SessionResponse) {
  req.headers["x-user-id"] = session.user.id;
  req.headers["x-user-email"] = session.user.email ?? "";
  req.headers["x-user-name"] = session.user.name ?? "";
}
