import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@neuralpay/auth";

// Base context — shared minimum shape all services provide
// Each service's createContext must return at least this shape
export interface BaseContext {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  _headers: Headers;
}

const t = initTRPC.context<BaseContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session, // narrowed — non-null
    },
  });
});
