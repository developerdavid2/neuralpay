import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type {
  NotificationEvent,
  AiInsightPayload,
  AiWeeklyReportPayload,
} from "@neuralpay/types";

type AiEvent = Extract<
  NotificationEvent,
  { type: "ai_insight" | "ai_weekly_report" }
>;

export async function handleAi(event: AiEvent) {
  console.log("[handleAi] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  let body: string;
  let relatedId: string;

  switch (event.type) {
    case "ai_weekly_report": {
      const p = payload as AiWeeklyReportPayload;
      title = "Your Weekly Report is Ready";
      body = p.summary;
      relatedId = p.reportId;
      break;
    }
    case "ai_insight": {
      const p = payload as AiInsightPayload;
      title = p.severity === "high" ? "Spending Anomaly" : "New AI Insight";
      body = p.title;
      relatedId = p.insightId;
      break;
    }
  }

  const result = await sendInApp(userId, event.type, "ai", title, body, {
    relatedId,
    relatedType: "insight",
  });

  if (!result.success) {
    console.error("[handleAi] sendInApp FAILED:", result.error, result.code);
    return;
  }

  const notification = result.data;

  if (!prefs.success) {
    console.error(
      "[handleAi] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
  } else {
    const alertsEnabled =
      event.type === "ai_weekly_report"
        ? prefs.data.weeklyReport
        : prefs.data.insightsAlerts;

    if (prefs.data.pushEnabled && alertsEnabled) {
      await sendPush(
        userId,
        notification.title,
        notification.body,
        notification.data,
      );
    }
  }

  await broadcastToUser(userId, { type: "notification.new", notification });
}
