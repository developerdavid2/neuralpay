import { webEnv } from "@neuralpay/env/web";
import { headers } from "next/headers";

interface Session {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
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

    // DEBUG: Log what we actually have
    console.log(
      "[getServerSession] Raw cookie header:",
      cookie ? "present" : "missing",
    );
    console.log("[getServerSession] Cookie length:", cookie?.length ?? 0);

    if (!cookie) {
      console.log("[getServerSession] No cookie in headers");
      return null;
    }

    const response = await fetch(
      `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/auth/get-session`,
      {
        headers: { cookie },
        cache: "no-store",
      },
    );

    console.log("[getServerSession] Auth response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[getServerSession] Auth error body:", errorText);
      return null;
    }

    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error("[getServerSession] Error:", error);
    return null;
  }
}

// Helper to check if user is authenticated on the server
export async function requireAuth(redirectTo: string = "/sign-in") {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
