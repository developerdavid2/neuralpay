import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";

const tmpl: Record<string, { title: string; body: (p: any) => string }> = {
  "split.invite": {
    title: "Split Request",
    body: (p) => `${p.invitedBy} invited you to split $${p.amount}`,
  },
  "split.paid": {
    title: "Split Payment Received",
    body: (p) => `${p.payerName} paid $${p.amount}`,
  },
  "split.settled": {
    title: "Split Settled",
    body: (p) => `"${p.title}" is fully settled`,
  },
};

export async function handleSplit(event: any) {
  const { userId, payload } = event;
  const prefs = await getUserPreferences(userId);
  const t = tmpl[event.type];

  const n = await sendInApp(
    userId,
    event.type.replace(".", "_"),
    "split",
    t?.title ?? "",
    t?.body(payload) ?? "",
    {
      relatedId: payload.splitId,
      relatedType: "split",
    },
  );
  if (!n) {
    return;
  }
  if (prefs.pushEnabled && prefs.splitNotifs) {
    await sendPush(userId, n.title, n.body, n.data as any);
  }
  broadcastToUser(userId, { type: "notification.new", notification: n });
}
