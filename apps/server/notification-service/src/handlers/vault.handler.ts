import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";

export async function handleVault(event: any) {
  const { userId, payload } = event;
  const prefs = await getUserPreferences(userId);

  if (event.type === "vault.milestone") {
    const n = await sendInApp(
      userId,
      "vault_milestone",
      "vault",
      `🎯 ${payload.vaultName} hit ${payload.milestone}%`,
      `$${payload.current} of $${payload.target} saved`,
      {
        relatedId: payload.vaultId,
        relatedType: "vault",
      },
    );
    if (!n) {
      return;
    }
    if (prefs.pushEnabled && prefs.vaultUpdates) {
      await sendPush(userId, n.title, n.body, n.data as any);
    }
    broadcastToUser(userId, { type: "notification.new", notification: n });
    return;
  }

  const n = await sendInApp(
    userId,
    "vault_contribution",
    "vault",
    "New Vault Contribution",
    `${payload.contributorName} added $${payload.amount}`,
    {
      relatedId: payload.vaultId,
      relatedType: "vault",
    },
  );

  if (!n) {
    return;
  }
  if (prefs.pushEnabled && prefs.vaultUpdates) {
    await sendPush(userId, n.title, n.body, n.data as any);
  }
  broadcastToUser(userId, { type: "notification.new", notification: n });
}
