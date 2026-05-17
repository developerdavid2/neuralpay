import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export interface BaseContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string;
      [key: string]: unknown;
    };
  } | null;
  _headers: Headers;
}

const t = initTRPC.context<BaseContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: { ...ctx, session: ctx.session },
  });
});

function sessionFromGatewayHeaders(
  nodeHeaders: NodeJS.Dict<string | string[]>,
): BaseContext["session"] {
  const userId = nodeHeaders["x-user-id"] as string | undefined;
  const email = nodeHeaders["x-user-email"] as string | undefined;
  const name = nodeHeaders["x-user-name"] as string | undefined;

  // Check for non-empty user ID (gateway auth middleware attaches it)
  if (userId && userId.trim()) {
    return {
      user: {
        id: userId,
        email: email ?? "",
        name: name ?? "",
      },
    };
  }

  return null;
}

// Unified createContext for Express
export async function createExpressContext(opts: {
  req: { headers: NodeJS.Dict<string | string[]> };
}): Promise<BaseContext> {
  // 1. Try gateway header first (proxied requests)
  const gatewaySession = sessionFromGatewayHeaders(opts.req.headers);
  if (gatewaySession) {
    const headers = new Headers();
    // Reconstruct minimal headers if needed downstream
    Object.entries(opts.req.headers).forEach(([k, v]) => {
      if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    });
    return { session: gatewaySession, _headers: headers };
  }

  // 2. Fallback: direct auth via better-auth (for direct API access, webhooks, etc.)
  // Only import dynamically to avoid loading auth in contexts where it's not needed
  const { auth } = await import("@neuralpay/auth");
  const { fromNodeHeaders } = await import("better-auth/node");

  const headers = fromNodeHeaders(opts.req.headers);

  try {
    const session = await auth.api.getSession({ headers });

    return {
      session: session
        ? {
            user: {
              ...session.user,
              id: session.user.id,
              email: session.user.email ?? "",
              name: session.user.name ?? "",
            },
          }
        : null,
      _headers: headers,
    };
  } catch (error) {
    // If better-auth fails, return null session (will trigger 401 on protected procedures)
    console.error("Failed to get session from better-auth:", error);
    return { session: null, _headers: headers };
  }
}

// Unified createContext for Fastify
export async function createFastifyContext(opts: {
  req: { headers: NodeJS.Dict<string | string[]> };
}): Promise<BaseContext> {
  // 1. Try gateway header first (proxied requests)
  const gatewaySession = sessionFromGatewayHeaders(opts.req.headers);
  if (gatewaySession) {
    const headers = new Headers();
    // Reconstruct minimal headers if needed downstream
    Object.entries(opts.req.headers).forEach(([k, v]) => {
      if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    });
    return { session: gatewaySession, _headers: headers };
  }

  // 2. Fallback: direct auth via better-auth (for direct API access, webhooks, etc.)
  // Only import dynamically to avoid loading auth in contexts where it's not needed
  const { auth } = await import("@neuralpay/auth");
  const { fromNodeHeaders } = await import("better-auth/node");

  const headers = fromNodeHeaders(opts.req.headers);

  try {
    const session = await auth.api.getSession({ headers });

    return {
      session: session
        ? {
            user: {
              ...session.user,
              id: session.user.id,
              email: session.user.email ?? "",
              name: session.user.name ?? "",
            },
          }
        : null,
      _headers: headers,
    };
  } catch (error) {
    // If better-auth fails, return null session (will trigger 401 on protected procedures)
    console.error("Failed to get session from better-auth:", error);
    return { session: null, _headers: headers };
  }
}
