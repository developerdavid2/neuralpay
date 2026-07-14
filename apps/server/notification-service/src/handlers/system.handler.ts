import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  SystemMaintenancePayload,
  SystemWelcomePayload,
} from "@neuralpay/types";

type SystemEvent = Extract<
  NotificationEvent,
  { type: "system_maintenance" | "system_welcome" }
>;

export async function handleSystem(event: SystemEvent) {
  console.log("[handleSystem] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;

  switch (event.type) {
    case "system_maintenance": {
      const p = payload as SystemMaintenancePayload;
      title = "Scheduled Maintenance";
      body = p.message;
      break;
    }
    case "system_welcome": {
      const p = payload as SystemWelcomePayload;
      title = `Welcome to NeuralPay, ${p.userName}!`;
      body = "We're glad you're here. Let's get your accounts connected.";
      break;
    }
  }

  const result = await sendInApp(userId, event.type, "system", title, body, {});

  if (!result.success) {
    console.error(
      "[handleSystem] sendInApp FAILED:",
      result.error,
      result.code,
    );
    return;
  }

  const notification = result.data;

  // No dedicated preference field for system notices — always-on,
  // gated only by pushEnabled.
  if (!prefs.success) {
    console.error(
      "[handleSystem] getUserPreferences FAILED:",
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
