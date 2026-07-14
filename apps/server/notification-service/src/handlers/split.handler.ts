import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  SplitInvitePayload,
  SplitPaidPayload,
  SplitSettledPayload,
  SplitReminderPayload,
} from "@neuralpay/types";

type SplitEvent = Extract<
  NotificationEvent,
  { type: "split_invite" | "split_paid" | "split_settled" | "split_reminder" }
>;

export async function handleSplit(event: SplitEvent) {
  console.log("[handleSplit] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;

  switch (event.type) {
    case "split_invite": {
      const p = payload as SplitInvitePayload;
      title = "Split Request";
      body = `${p.invitedBy} invited you to split $${p.amount}`;
      break;
    }
    case "split_paid": {
      const p = payload as SplitPaidPayload;
      title = "Split Payment Received";
      body = `${p.payerName} paid $${p.amount}`;
      break;
    }
    case "split_settled": {
      const p = payload as SplitSettledPayload;
      title = "Split Settled";
      body = `"${p.title}" is fully settled`;
      break;
    }
    case "split_reminder": {
      const p = payload as SplitReminderPayload;
      title = "Split Reminder";
      body = `You owe $${p.amountOwed} for "${p.title}"`;
      break;
    }
  }

  const result = await sendInApp(userId, event.type, "split", title, body, {
    relatedId: payload.splitId,
    relatedType: "split",
  });

  if (!result.success) {
    console.error("[handleSplit] sendInApp FAILED:", result.error, result.code);
    return;
  }

  const notification = result.data;

  if (!prefs.success) {
    console.error(
      "[handleSplit] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
  } else if (prefs.data.pushEnabled && prefs.data.splitNotifs) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  await broadcastToUser(userId, { type: "notification.new", notification });
}
