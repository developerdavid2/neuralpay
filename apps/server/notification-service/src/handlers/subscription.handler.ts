import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  SubscriptionRenewedPayload,
  SubscriptionExpiringPayload,
  SubscriptionCancelledPayload,
  NotificationEvent,
} from "@neuralpay/types";

type SubscriptionEvent = Extract<
  NotificationEvent,
  | { type: "subscription_renewed" }
  | { type: "subscription_expiring" }
  | { type: "subscription_cancelled" }
>;

export async function handleSubscription(event: SubscriptionEvent) {
  console.log("[handleSubscription] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;

  switch (event.type) {
    case "subscription_renewed": {
      const p = payload as SubscriptionRenewedPayload;
      title = "Subscription Renewed";
      body = `${p.plan} renewed — $${p.amount} charged`;
      break;
    }
    case "subscription_expiring": {
      const p = payload as SubscriptionExpiringPayload;
      title = "Subscription Expiring Soon";
      body = `${p.plan} expires in ${p.daysLeft} day${p.daysLeft === 1 ? "" : "s"}`;
      break;
    }
    case "subscription_cancelled": {
      const p = payload as SubscriptionCancelledPayload;
      title = "Subscription Cancelled";
      body = `${p.plan} ends on ${p.endDate}`;
      break;
    }
  }

  const result = await sendInApp(
    userId,
    event.type,
    "subscription",
    title,
    body,
    {}, // no single related record for subscription events
  );

  if (!result.success) {
    console.error(
      "[handleSubscription] sendInApp FAILED:",
      result.error,
      result.code,
    );
    return;
  }

  const notification = result.data;

  // No dedicated `subscriptionAlerts` preference field exists yet —
  // gated on pushEnabled only. Add a toggle if you want it independently
  // mutable.
  if (!prefs.success) {
    console.error(
      "[handleSubscription] getUserPreferences FAILED:",
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
