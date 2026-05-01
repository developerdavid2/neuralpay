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

    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/auth/get-session`,
      {
        headers: {
          Cookie: headersList.get("cookie") || "",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error("Session fetch error:", error);
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

// Helper to check if user is verified
export async function requireVerifiedAuth(redirectTo: string = "/verify-otp") {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session.user.emailVerified) {
    throw new Error("Email not verified");
  }
  return session;
}

// Don't export auth from here - it's causing the database initialization
// export { auth };
