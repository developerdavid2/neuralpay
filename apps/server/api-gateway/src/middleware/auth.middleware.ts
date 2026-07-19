import { gatewayEnv } from "@neuralpay/env/gateway";
import type { NextFunction, Request, Response } from "express";
import { getCachedSession, setCachedSession } from "../lib/session-cache";

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

    console.log(
      "[authMiddleware] fetching session from:",
      `${gatewayEnv.USER_SERVICE_URL}/api/auth/get-session`,
    );
    console.log("[authMiddleware] cookie present:", !!cookie);

    const sessionRes = await fetch(
      `${gatewayEnv.USER_SERVICE_URL}/api/auth/get-session`,
      {
        headers: {
          cookie,
          "x-forwarded-host":
            req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "",
          "x-forwarded-proto":
            (req.headers["x-forwarded-proto"] as string) ?? "https",
        },
      },
    );

    console.log("[authMiddleware] session response status:", sessionRes.status);

    if (!sessionRes.ok) {
      const text = await sessionRes.text();
      console.log("[authMiddleware] session error:", text);
      return next();
    }

    const session = (await sessionRes.json()) as SessionResponse | null;
    console.log("[authMiddleware] session user:", session?.user?.id ?? "null");

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
