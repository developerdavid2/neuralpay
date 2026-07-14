import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  VaultMilestonePayload,
  VaultContributionPayload,
  VaultInvitePayload,
} from "@neuralpay/types";

type VaultEvent = Extract<
  NotificationEvent,
  { type: "vault_milestone" | "vault_contribution" | "vault_invite" }
>;

export async function handleVault(event: VaultEvent) {
  console.log("[handleVault] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;

  switch (event.type) {
    case "vault_milestone": {
      const p = payload as VaultMilestonePayload;
      title = `${p.vaultName} hit ${p.milestone}%`;
      body = `$${p.current} of $${p.target} saved`;
      break;
    }
    case "vault_contribution": {
      const p = payload as VaultContributionPayload;
      title = "New Vault Contribution";
      body = `${p.contributorName} added $${p.amount}`;
      break;
    }
    case "vault_invite": {
      const p = payload as VaultInvitePayload;
      title = "Vault Invite";
      body = `${p.invitedBy} invited you to "${p.vaultName}"`;
      break;
    }
  }

  const result = await sendInApp(userId, event.type, "vault", title, body, {
    relatedId: payload.vaultId,
    relatedType: "vault",
  });

  if (!result.success) {
    console.error("[handleVault] sendInApp FAILED:", result.error, result.code);
    return;
  }

  const notification = result.data;

  if (!prefs.success) {
    console.error(
      "[handleVault] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
  } else if (prefs.data.pushEnabled && prefs.data.vaultUpdates) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  await broadcastToUser(userId, { type: "notification.new", notification });
}
