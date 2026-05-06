import { router } from "@neuralpay/config/trpc";
import { usersRouter } from "@neuralpay/user-service/routers";
import { aiRouter } from "@neuralpay/ai-service/routers";

export const appRouter = router({
  users: usersRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
