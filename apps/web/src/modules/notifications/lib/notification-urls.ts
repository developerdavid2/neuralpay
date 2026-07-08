import type { Route } from "next";
import type { NotificationType } from "@neuralpay/types";

type RouteConfig = {
  path: string;
  idParamName: string;
  defaultParams?: Record<string, string>;
};

const eventRouteMap: Record<NotificationType, RouteConfig | null> = {
  // ── Transactions
  transaction_created: {
    path: "/dashboard/transactions",
    idParamName: "focusTransactionId",
    defaultParams: { mode: "view" },
  },
  transaction_anomaly: {
    path: "/dashboard/transactions",
    idParamName: "focusTransactionId",
    defaultParams: { mode: "view", tab: "anomaly" },
  },

  // ── AI
  ai_insight: {
    path: "/dashboard/insights",
    idParamName: "focusInsightId",
  },
  ai_weekly_report: {
    path: "/dashboard/insights",
    idParamName: "focusReportId",
    defaultParams: { type: "weekly" },
  },
  ai_coach_response: {
    path: "/dashboard/ai-coach",
    idParamName: "sessionId",
  },

  // ── Splits
  split_invite: {
    path: "/dashboard/splits",
    idParamName: "focusSplitId",
    defaultParams: { mode: "invite" },
  },
  split_paid: {
    path: "/dashboard/splits",
    idParamName: "focusSplitId",
    defaultParams: { mode: "payment" },
  },
  split_settled: {
    path: "/dashboard/splits",
    idParamName: "focusSplitId",
    defaultParams: { mode: "settled" },
  },
  split_reminder: {
    path: "/dashboard/splits",
    idParamName: "focusSplitId",
    defaultParams: { mode: "reminder" },
  },

  // ── Vaults
  vault_milestone: {
    path: "/dashboard/vaults",
    idParamName: "focusVaultId",
    defaultParams: { mode: "milestone" },
  },
  vault_contribution: {
    path: "/dashboard/vaults",
    idParamName: "focusVaultId",
    defaultParams: { mode: "contribution" },
  },
  vault_invite: {
    path: "/dashboard/vaults",
    idParamName: "focusVaultId",
    defaultParams: { mode: "invite" },
  },
  vault_invite_accepted: {
    path: "/dashboard/vaults",
    idParamName: "focusVaultId",
    defaultParams: { mode: "members" },
  },

  // ── Accounts
  account_connected: {
    path: "/dashboard/accounts",
    idParamName: "focusAccountId",
    defaultParams: { mode: "connected" },
  },
  account_disconnected: {
    path: "/dashboard/accounts",
    idParamName: "focusAccountId",
    defaultParams: { mode: "disconnected" },
  },
  account_sync_failed: {
    path: "/dashboard/accounts",
    idParamName: "focusAccountId",
    defaultParams: { mode: "sync-error" },
  },

  // ── Budgets
  budget_threshold: {
    path: "/dashboard/budgets",
    idParamName: "focusBudgetId",
    defaultParams: { mode: "threshold" },
  },

  // ── Subscriptions
  subscription_renewed: {
    path: "/dashboard/settings/billing",
    idParamName: "focusSubscriptionId",
    defaultParams: { mode: "renewed" },
  },
  subscription_expiring: {
    path: "/dashboard/settings/billing",
    idParamName: "focusSubscriptionId",
    defaultParams: { mode: "expiring" },
  },
  subscription_cancelled: {
    path: "/dashboard/settings/billing",
    idParamName: "focusSubscriptionId",
    defaultParams: { mode: "cancelled" },
  },

  // ── Security
  security_alert: {
    path: "/dashboard/settings/security",
    idParamName: "focusAlertId",
  },

  // ── System (no deep link — just go to dashboard)
  system_maintenance: null,
  system_welcome: null,
  system: null,
};

function extractRelatedId(
  type: NotificationType,
  data: Record<string, unknown>,
): string | undefined {
  switch (type) {
    // Transactions
    case "transaction_created":
    case "transaction_anomaly":
      return data.transactionId as string;

    // AI
    case "ai_insight":
      return data.insightId as string;
    case "ai_weekly_report":
      return data.reportId as string;
    case "ai_coach_response":
      return data.sessionId as string;

    // Splits
    case "split_invite":
    case "split_paid":
    case "split_settled":
    case "split_reminder":
      return data.splitId as string;

    // Vaults
    case "vault_milestone":
    case "vault_contribution":
    case "vault_invite":
    case "vault_invite_accepted":
      return data.vaultId as string;

    // Accounts
    case "account_connected":
    case "account_disconnected":
    case "account_sync_failed":
      return data.accountId as string;

    // Budgets
    case "budget_threshold":
      return data.budgetId as string;

    // Subscriptions
    case "subscription_renewed":
    case "subscription_expiring":
    case "subscription_cancelled":
      return undefined;

    // Security
    case "security_alert":
      return data.alertId as string;

    // System
    case "system_maintenance":
    case "system_welcome":
    case "system":
      return undefined;
  }
}

export function buildNotificationUrl(
  type: NotificationType,
  data: Record<string, unknown>,
): Route {
  const config = eventRouteMap[type];

  // System events with no deep link
  if (!config) {
    return "/dashboard" as Route;
  }

  const relatedId = extractRelatedId(type, data);

  if (relatedId) {
    const params = new URLSearchParams({
      ...config.defaultParams,
      [config.idParamName]: relatedId,
    });
    return `${config.path}?${params.toString()}` as Route;
  }

  return config.path as Route;
}
