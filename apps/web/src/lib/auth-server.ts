// lib/auth-server.ts
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

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

    const appUrl = new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
    );

    const response = await fetch(
      `${process.env.SERVER_URL}/v1/auth/get-session`,
      {
        headers: {
          cookie,
          "x-forwarded-host": appUrl.host, // neuralpayai.vercel.app
          "x-forwarded-proto": appUrl.protocol.replace(":", ""), // https
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;
    return (await response.json()) ?? null;
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
