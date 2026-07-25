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

    console.log("[getServerSession] cookie:", cookie?.substring(0, 50));

    if (!cookie) return null;

    const appUrl = new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "https://neuralpayai.vercel.app",
    );
    const serverUrl = process.env.SERVER_URL;

    console.log(
      "[getServerSession] fetching from:",
      `${serverUrl}/v1/auth/get-session`,
    );

    const response = await fetch(`${serverUrl}/v1/auth/get-session`, {
      headers: {
        cookie,
        "x-forwarded-host": appUrl.host,
        "x-forwarded-proto": "https",
      },
      cache: "no-store",
    });

    console.log("[getServerSession] status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.log("[getServerSession] error:", text);
      return null;
    }

    const data = await response.json();
    console.log("[getServerSession] user:", (data as any)?.user?.id);
    return data ?? null;
  } catch (error) {
    console.error("[getServerSession] threw:", error);
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
