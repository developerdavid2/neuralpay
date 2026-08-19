import { aiRouter } from "@orra/ai-service/routers";
import { router } from "@orra/config/trpc";
import { notificationsRouter } from "@orra/notification-service/routers";
import { paymentsRouter } from "@orra/payment-service/routers";
import { type UserFileRouter, usersRouter } from "@orra/user-service/routers";

export const appRouter = router({
  users: usersRouter,
  ai: aiRouter,
  payments: paymentsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
export type UserUploadFileRouter = UserFileRouter;
