import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";

export async function handleAccount(event: any) {
  const { userId, payload } = event;
  const prefs = await getUserPreferences(userId);
  const connected = event.type === "account.connected";

  const n = await sendInApp(
    userId,
    connected ? "account_connected" : "account_disconnected",
    "transaction",
    connected ? "Account Connected" : "Account Disconnected",
    connected
      ? `${payload.bankName} is now linked`
      : `${payload.bankName} has been unlinked`,
    {
      actionUrl: "/dashboard/accounts",
      relatedId: payload.accountId,
      relatedType: "account",
    },
  );

  if (!n) {
    return;
  }
  if (prefs.pushEnabled && prefs.paymentAlerts) {
    await sendPush(userId, n.title, n.body, n.data as any);
  }
  broadcastToUser(userId, { type: "notification.new", notification: n });
}
