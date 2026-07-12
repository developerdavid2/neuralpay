// handlers/transaction.handler.ts
import { TRPCError } from "@trpc/server";
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

  // transaction_anomaly
  if (event.type === "transaction_anomaly") {
    const p = payload as TransactionAnomalyPayload;

    const result = await sendInApp(
      userId,
      "transaction_anomaly",
      "transaction",
      "Unusual Transaction Detected",
      `${p.merchant} — $${p.amount}`,
      {
        relatedId: p.transactionId,
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
    console.log("[handleTransaction] notification created:", notification.id);

    if (!prefs.success) {
      console.error(
        "[handleTransaction] sendPush FAILED:",
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

    broadcastToUser(userId, {
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
    return new TRPCError({
      code: "BAD_REQUEST",
    });
  }

  if (prefs.data.pushEnabled && prefs.data.transactionAlerts) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  broadcastToUser(userId, {
    type: "notification.new",
    notification,
  });
}
