// handlers/transaction.handler.ts
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
  console.log("[handleTransaction] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  console.log(
    "[handleTransaction] userId:",
    userId,
    "payload:",
    JSON.stringify(payload, null, 2),
  );

  const prefs = await getUserPreferences(userId);
  console.log("[handleTransaction] prefs:", JSON.stringify(prefs));

  if (event.type === "transaction_anomaly") {
    const p = payload as TransactionAnomalyPayload;

    console.log("[handleTransaction] handling anomaly");

    const result = await sendInApp(
      userId,
      "transaction_anomaly",
      "transaction",
      "🚨 Unusual Transaction Detected",
      `${p.merchant} — $${p.amount}`,
      {
        relatedId: p.transactionId,
        relatedType: "transaction",
      },
    );

    console.log(
      "[handleTransaction] sendInApp result:",
      JSON.stringify(result, null, 2),
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
    console.log("[handleTransaction] notification created:", notification.id);

    if (prefs.pushEnabled && prefs.anomalyAlerts) {
      console.log("[handleTransaction] sending push...");
      await sendPush(
        userId,
        notification.title,
        notification.body,
        notification.data,
      );
    }

    console.log("[handleTransaction] broadcasting to user:", userId);
    await broadcastToUser(userId, {
      type: "notification.new",
      notification,
    });

    return;
  }

  // transaction_created
  const p = payload as TransactionCreatedPayload;

  console.log("[handleTransaction] handling transaction_created");

  const result = await sendInApp(
    userId,
    "transaction_created",
    "transaction",
    "New Transaction",
    `${p.merchant} — $${p.amount}`,
    {
      relatedId: p.transactionId,
      relatedType: "transaction",
    },
  );

  console.log(
    "[handleTransaction] sendInApp result:",
    JSON.stringify(result, null, 2),
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
  console.log("[handleTransaction] notification created:", notification.id);

  console.log("[handleTransaction] prefs:", JSON.stringify(prefs));

  if (prefs.pushEnabled && prefs.paymentAlerts) {
    console.log("[handleTransaction] sending push...");
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  console.log("[handleTransaction] broadcasting to user:", userId);
  await broadcastToUser(userId, {
    type: "notification.new",
    notification,
  });
}
