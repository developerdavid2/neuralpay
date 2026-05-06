import { publicProcedure, router } from "../../../config/src/trpc";
import { aiRouter } from "./ai";
import { paymentsRouter } from "./payments";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "api-gateway" })),

  payments: paymentsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
