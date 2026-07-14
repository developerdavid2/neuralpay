import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type { NotificationEvent } from "@neuralpay/types";

type SecurityEvent = Extract<NotificationEvent, { type: "security_alert" }>;

export async function handleSecurity(event: SecurityEvent) {
  console.log("[handleSecurity] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  const result = await sendInApp(
    userId,
    "security_alert",
    "security",
    "🔒 Security Alert",
    payload.message,
    {},
  );

  if (!result.success) {
    console.error(
      "[handleSecurity] sendInApp FAILED:",
      result.error,
      result.code,
    );
    return;
  }

  const notification = result.data;

  // Security alerts intentionally bypass preference toggles — a
  // compromised-account warning shouldn't be silenceable via settings.
  // Only pushEnabled controls whether it also reaches a device.
  if (!prefs.success) {
    console.error(
      "[handleSecurity] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
  } else if (prefs.data.pushEnabled) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  await broadcastToUser(userId, { type: "notification.new", notification });
}
