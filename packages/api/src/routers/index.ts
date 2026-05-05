import { publicProcedure, router } from "../trpc";
import { aiRouter } from "./ai";
import { paymentsRouter } from "./payments";
import { usersRouter } from "./users";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "api-gateway" })),
  users: usersRouter,
  payments: paymentsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
