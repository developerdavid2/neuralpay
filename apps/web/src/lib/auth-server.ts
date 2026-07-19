// lib/auth-server.ts
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
    if (!cookie) return null;

    const serverUrl = process.env.SERVER_URL;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://neuralpayai.vercel.app";

    if (!serverUrl) {
      console.error("[getServerSession] SERVER_URL is not set");
      return null;
    }

    const url = new URL(appUrl);
    const response = await fetch(`${serverUrl}/v1/auth/get-session`, {
      headers: {
        cookie,
        "x-forwarded-host": url.host,
        "x-forwarded-proto": url.protocol.replace(":", ""),
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) ?? null;
  } catch (error) {
    console.error("[getServerSession] THREW:", error);
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
