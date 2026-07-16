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
  resHeaders?: { append: (key: string, value: string) => void };
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

function headersFromNodeHeaders(
  nodeHeaders: NodeJS.Dict<string | string[]>,
): Headers {
  const headers = new Headers();
  Object.entries(nodeHeaders).forEach(([k, v]) => {
    if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  });
  return headers;
}

// ── Auth injection type (loosely typed to avoid importing better-auth) ──
export interface AuthAPI {
  api: {
    getSession: (opts: { headers: Headers }) => Promise<{
      user: {
        id: string;
        email: string;
        name?: string | null;
        [key: string]: unknown;
      };
    } | null>;
  };
}

// ── Express ──
export interface ExpressContextOptions {
  req: { headers: NodeJS.Dict<string | string[]> };
  auth?: AuthAPI;
}

export async function createExpressContext(
  opts: ExpressContextOptions,
): Promise<BaseContext> {
  const gatewaySession = sessionFromGatewayHeaders(opts.req.headers);
  const baseHeaders = headersFromNodeHeaders(opts.req.headers);

  if (gatewaySession) {
    return { session: gatewaySession, _headers: baseHeaders };
  }

  if (opts.auth) {
    const { fromNodeHeaders } = await import("better-auth/node");

    // Explicitly reconstruct standard web headers from Node request headers
    const webHeaders = fromNodeHeaders(opts.req.headers);

    try {
      // Pass the fully normalized headers containing valid cookies, forwarded-host, and proto
      const session = await opts.auth.api.getSession({ headers: webHeaders });
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
        _headers: webHeaders,
      };
    } catch (error) {
      console.error("Failed to get session from better-auth:", error);
      return { session: null, _headers: webHeaders };
    }
  }

  return { session: null, _headers: baseHeaders };
}

// ── Fastify ──
export interface FastifyContextOptions {
  req: { headers: NodeJS.Dict<string | string[]> };
  auth?: AuthAPI;
}

export async function createFastifyContext(
  opts: FastifyContextOptions,
): Promise<BaseContext> {
  const resHeaders = new Headers();
  const gatewaySession = sessionFromGatewayHeaders(opts.req.headers);
  const baseHeaders = headersFromNodeHeaders(opts.req.headers);

  if (gatewaySession) {
    return { session: gatewaySession, _headers: baseHeaders, resHeaders };
  }

  if (opts.auth) {
    const { fromNodeHeaders } = await import("better-auth/node");
    const headers = fromNodeHeaders(opts.req.headers);

    try {
      const session = await opts.auth.api.getSession({ headers });
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
        resHeaders,
      };
    } catch (error) {
      console.error("Failed to get session from better-auth:", error);
      return { session: null, _headers: headers, resHeaders };
    }
  }

  return { session: null, _headers: baseHeaders, resHeaders };
}
