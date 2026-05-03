// packages/api/src/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@neuralpay/auth";
import type { Context } from "./context";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export interface AuthenticatedContext extends Context {
  session: Session;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: ctx._headers });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session,
    } as AuthenticatedContext,
  });
});
