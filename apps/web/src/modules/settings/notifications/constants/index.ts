import type { NotificationPreferences } from "@neuralpay/types";

export type AlertPreferenceKey = Extract<
  keyof NotificationPreferences,
  | "transactionAlerts"
  | "accountAlerts"
  | "insightsAlerts"
  | "coachAlerts"
  | "budgetAlerts"
  | "splitNotifs"
  | "vaultUpdates"
  | "weeklyReport"
>;

export const alertPreferenceRows: Array<{
  key: AlertPreferenceKey;
  label: string;
  description: string;
}> = [
  {
    key: "transactionAlerts",
    label: "Transaction alerts",
    description: "Receive notifications for payment and transaction activity.",
  },
  {
    key: "accountAlerts",
    label: "Account alerts",
    description:
      "Get notified when accounts are connected, disconnected, or sync fails.",
  },
  {
    key: "insightsAlerts",
    label: "AI insights",
    description: "Receive AI-generated insights about your spending patterns.",
  },
  {
    key: "coachAlerts",
    label: "AI coach",
    description: "Get notified when your AI coach has a new response or tip.",
  },
  {
    key: "budgetAlerts",
    label: "Budget alerts",
    description: "Receive alerts when your budget thresholds are reached.",
  },
  {
    key: "splitNotifs",
    label: "Split notifications",
    description:
      "Get notified when split invitations, payments, or settlements occur.",
  },
  {
    key: "vaultUpdates",
    label: "Vault updates",
    description:
      "Receive updates about vault goals, contributions, and invitations.",
  },
  {
    key: "weeklyReport",
    label: "Weekly report",
    description: "Receive a weekly summary of your activity and health score.",
  },
];

export const emailPreferenceRows: Array<{
  key: Extract<keyof NotificationPreferences, "emailEnabled">;
  label: string;
  description: string;
}> = [
  {
    key: "emailEnabled",
    label: "Email notifications",
    description: "Receive notification emails when important events happen.",
  },
];
