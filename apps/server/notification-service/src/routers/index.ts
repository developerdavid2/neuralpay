import { router } from "@orra/config/trpc";
import { appNotificationRouter } from "./notifications.router";

export const notificationsRouter = router({
  appNotifications: appNotificationRouter,
});

export type NotificationsRouter = typeof notificationsRouter;
