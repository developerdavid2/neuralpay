import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";

export async function handleAnomaly(event: any) {
  const { userId, payload } = event;
  const prefs = await getUserPreferences(userId);

  const n = await sendInApp(
    userId,
    "budget_threshold",
    "budget",
    "Budget Alert",
    `You've used ${payload.percentage}% of your ${payload.category} budget ($${payload.spent} / $${payload.limit})`,
    {
      actionUrl: "/dashboard/ai-insights",
      relatedId: payload.budgetId,
      relatedType: "insight",
    },
  );

  if (!n) {
    return;
  }
  if (prefs.pushEnabled && prefs.budgetAlerts) {
    await sendPush(userId, n.title, n.body, n.data as any);
  }
  broadcastToUser(userId, { type: "notification.new", notification: n });
}
