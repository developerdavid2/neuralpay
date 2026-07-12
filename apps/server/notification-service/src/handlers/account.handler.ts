import { TRPCError } from "@trpc/server";
import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  AccountConnectedPayload,
  AccountDisconnectedPayload,
  AccountSyncFailedPayload,
} from "@neuralpay/types";

type AccountEvent = Extract<
  NotificationEvent,
  | { type: "account_connected" }
  | { type: "account_disconnected" }
  | { type: "account_sync_failed" }
>;

export async function handleAccount(event: AccountEvent) {
  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;
  let notificationType:
    | "account_connected"
    | "account_disconnected"
    | "account_sync_failed";

  switch (event.type) {
    case "account_connected": {
      const p = payload as AccountConnectedPayload;
      notificationType = "account_connected";
      title = "Account Connected";
      body = `${p.bankName} is now linked`;
      break;
    }
    case "account_disconnected": {
      const p = payload as AccountDisconnectedPayload;
      notificationType = "account_disconnected";
      title = "Account Disconnected";
      body = `${p.bankName} has been unlinked`;
      break;
    }
    case "account_sync_failed": {
      const p = payload as AccountSyncFailedPayload;
      notificationType = "account_sync_failed";
      title = "Account Sync Failed";
      body = `${p.bankName}: ${p.error}`;
      break;
    }
  }

  const result = await sendInApp(
    userId,
    notificationType,
    "account",
    title,
    body,
    {
      relatedId: payload.accountId,
      relatedType: "account",
    },
  );

  if (!result.success) {
    console.error(
      "[handleAccount] sendInApp FAILED:",
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

  if (prefs.data.pushEnabled && prefs.data.accountAlerts) {
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
