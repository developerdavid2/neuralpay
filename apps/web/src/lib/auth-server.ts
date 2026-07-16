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

export async function getServerSession(): Promise<Session | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    if (!cookie) return null;

    const response = await fetch(
      `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/auth/get-session`,
      {
        headers: { cookie },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data ?? null;
  } catch (error) {
    console.error("[getServerSession]", error);
    return null;
  }
}

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
