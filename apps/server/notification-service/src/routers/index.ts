import { router } from "@neuralpay/config/trpc";
import { appNotificationRouter } from "./notifications.router";

export const notificationsRouter = router({
  appNotifications: appNotificationRouter,
});

export type NotificationsRouter = typeof notificationsRouter;
