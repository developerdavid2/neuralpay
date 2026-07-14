import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  TransactionCreatedPayload,
  TransactionAnomalyPayload,
} from "@neuralpay/types";

type TransactionEvent = Extract<
  NotificationEvent,
  { type: "transaction_created" | "transaction_anomaly" }
>;

export async function handleTransaction(event: TransactionEvent) {
  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;
  let notificationType: "transaction_created" | "transaction_anomaly";

  switch (event.type) {
    case "transaction_created": {
      const p = payload as TransactionCreatedPayload;
      notificationType = "transaction_created";
      title = "New Transaction";
      body = `${p.merchant} — $${p.amount}`;
      break;
    }
    case "transaction_anomaly": {
      const p = payload as TransactionAnomalyPayload;
      notificationType = "transaction_anomaly";
      title = "Unusual Transaction Detected";
      body = `${p.merchant} — $${p.amount}`;
      break;
    }
  }

  const result = await sendInApp(
    userId,
    notificationType,
    "transaction",
    title,
    body,
    {
      relatedId: payload.transactionId,
      relatedType: "transaction",
    },
  );

  if (!result.success) {
    console.error(
      "[handleTransaction] sendInApp FAILED:",
      result.error,
      result.code,
    );
    return;
  }

  const notification = result.data;

  if (!prefs.success) {
    console.error(
      "[handleTransaction] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
    return;
  }

  if (prefs.data.pushEnabled && prefs.data.transactionAlerts) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  await broadcastToUser(userId, {
    type: "notification.new",
    notification,
  });
}
