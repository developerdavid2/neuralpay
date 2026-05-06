import { initTRPC, TRPCError } from "@trpc/server";

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

const t = initTRPC.context<BaseContext>().create();

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
