import { router } from "@neuralpay/config/trpc";
import { usersRouter } from "@neuralpay/user-service/routers";
import { aiRouter } from "@neuralpay/ai-service/routers";
import { paymentsRouter } from "@neuralpay/payment-service/routers";
import { notificationsRouter } from "@neuralpay/notification-service/routers";

export const appRouter = router({
  users: usersRouter,
  ai: aiRouter,
  payments: paymentsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
