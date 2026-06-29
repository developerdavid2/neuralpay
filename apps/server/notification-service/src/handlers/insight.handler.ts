import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";

export async function handleAi(event: any) {
  const { userId, payload } = event;
  const prefs = await getUserPreferences(userId);

  if (event.type === "ai.weekly_report") {
    const n = await sendInApp(
      userId,
      "ai_weekly_report",
      "ai",
      "Your Weekly Report is Ready",
      payload.summary,
      {
        actionUrl: "/dashboard/ai-insights?tab=weekly",
        relatedId: payload.reportId,
        relatedType: "insight",
      },
    );
    if (!n) {
      return;
    }
    if (prefs.pushEnabled && prefs.weeklyReport) {
      await sendPush(userId, n.title, n.body, n.data as any);
    }
    broadcastToUser(userId, { type: "notification.new", notification: n });
    return;
  }

  const title =
    payload.severity === "high" ? "🚨 Spending Anomaly" : "New AI Insight";
  const n = await sendInApp(userId, "ai_insight", "ai", title, payload.title, {
    actionUrl: `/dashboard/ai-insights?insight=${payload.insightId}`,
    relatedId: payload.insightId,
    relatedType: "insight",
  });
  if (!n) {
    return;
  }
  if (prefs.pushEnabled && prefs.anomalyAlerts) {
    await sendPush(userId, n.title, n.body, n.data as any);
  }
  broadcastToUser(userId, { type: "notification.new", notification: n });
}
