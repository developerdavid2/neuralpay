// lib/auth-server.ts
import { webEnv } from "@neuralpay/env/web";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface Session {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    planTier?: string;
  };
  session: {
    id: string;
    expiresAt: string;
    token: string;
  };
}

export const getServerSession = async (): Promise<Session | null> => {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    console.log("[getServerSession] cookie present:", !!cookie);
    console.log("[getServerSession] cookie value:", cookie?.substring(0, 100));
    console.log("[getServerSession] SERVER_URL:", webEnv.SERVER_URL);

    if (!cookie) return null;

    const appUrl = new URL(webEnv.NEXT_PUBLIC_APP_URL);

    const response = await fetch(`${webEnv.SERVER_URL}/v1/auth/get-session`, {
      headers: {
        cookie,
        "x-forwarded-host": appUrl.host,
        "x-forwarded-proto": appUrl.protocol.replace(":", ""),
      },
      cache: "no-store",
    });

    console.log("[getServerSession] response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.log("[getServerSession] error body:", text);
      return null;
    }

    const data = await response.json();
    console.log(
      "[getServerSession] session data:",
      JSON.stringify(data).substring(0, 200),
    );
    return data ?? null;
  } catch (error) {
    console.error("[getServerSession]", error);
    return null;
  }
};

/**
 * Use in layouts — redirects to sign-in if not authenticated.
 * Optionally redirects to verify-otp if email not verified.
 */
export async function requireAuth({
  redirectTo = "/auth/signin",
  requireEmailVerified = true,
}: {
  redirectTo?: string;
  requireEmailVerified?: boolean;
} = {}): Promise<Session> {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(redirectTo as Route);
  }

  if (requireEmailVerified && !session.user.emailVerified) {
    redirect("/auth/verify-otp");
  }

  return session;
}

/**
 * Use in auth pages (signin, signup) — redirects to dashboard if already logged in.
 */
export async function redirectIfAuthenticated(
  to: string = "/dashboard",
): Promise<void> {
  const session = await getServerSession();
  if (session?.user) {
    redirect(to as Route);
  }
}
