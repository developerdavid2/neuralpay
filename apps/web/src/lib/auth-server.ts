import { auth } from "@neuralpay/auth";
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

    if (!cookie) return null;

    const h = new Headers();
    h.set("cookie", cookie);

    const session = await auth.api.getSession({ headers: h });
    return session as Session | null;
  } catch (error) {
    console.error("[getServerSession] Error:", error);
    return null;
  }
}

export async function requireAuth(redirectTo: string = "/auth/signin") {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
