// channels/inapp.ts
import type {
  NotificationType,
  NotificationCategory,
  CreateNotificationInput,
  NotificationData,
} from "@neuralpay/types";
import { createNotification } from "../services/notifications.service";

export async function sendInApp(
  userId: string,
  type: NotificationType,
  category: NotificationCategory,
  title: string,
  body: string,
  data?: NotificationData,
) {
  console.log("[sendInApp] START — userId:", userId, "type:", type);

  const input: CreateNotificationInput = {
    userId,
    type,
    category,
    title,
    body,
    data: data ?? {},
  };

  console.log("[sendInApp] input:", JSON.stringify(input, null, 2));

  const result = await createNotification(input);

  console.log(
    "[sendInApp] createNotification result:",
    JSON.stringify(result, null, 2),
  );

  return result;
}
