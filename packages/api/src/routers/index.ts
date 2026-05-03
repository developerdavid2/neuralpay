import { publicProcedure, router } from "../trpc";
import { usersRouter } from "./users/index";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "api-gateway" })),
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
