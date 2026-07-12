import { sendInApp } from "../channels/inapp";
import { sendPush } from "../channels/push";
import { broadcastToUser } from "../channels/realtime";
import { getUserPreferences } from "../services/preferences.service";
import type { NotificationEvent } from "@neuralpay/types";

type BudgetEvent = Extract<NotificationEvent, { type: "budget_threshold" }>;

export async function handleBudget(event: BudgetEvent) {
  console.log("[handleBudget] START — type:", event.type);

  const { payload } = event;
  const { userId } = payload;

  const prefs = await getUserPreferences(userId);

  let title: string;
  switch (true) {
    case payload.percentage >= 100:
      title = "🚨 Budget Exceeded";
      break;
    case payload.percentage >= 90:
      title = "⚠️ Budget Almost Exceeded";
      break;
    default:
      title = "Budget Alert";
  }
  const body = `${payload.category}: $${payload.spent} of $${payload.limit} (${payload.percentage}%)`;

  // relatedType omitted — "budget" isn't in notificationDataSchema's
  // relatedType enum yet (transaction | split | vault | account | insight).
  const result = await sendInApp(
    userId,
    "budget_threshold",
    "budget",
    title,
    body,
    { relatedId: payload.budgetId },
  );

  if (!result.success) {
    console.error(
      "[handleBudget] sendInApp FAILED:",
      result.error,
      result.code,
    );
    return;
  }

  const notification = result.data;

  if (!prefs.success) {
    console.error(
      "[handleBudget] getUserPreferences FAILED:",
      prefs.error,
      prefs.code,
    );
    return;
  }

  if (prefs.data.pushEnabled && prefs.data.budgetAlerts) {
    await sendPush(
      userId,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  await broadcastToUser(userId, { type: "notification.new", notification });
}
