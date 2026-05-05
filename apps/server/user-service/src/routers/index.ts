import { router } from "@neuralpay/api/trpc";
import { usersRouter } from "./profile.router";

export const appRouter = router({
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
