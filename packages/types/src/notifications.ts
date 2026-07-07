import { z } from "zod";

// ── Notification Categories
export const NOTIFICATION_CATEGORY = [
  "transaction",
  "budget",
  "split",
  "vault",
  "account",
  "security",
  "system",
  "ai",
  "subscription",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORY)[number];

// ── Notification Types (events that trigger notifications)
export const NOTIFICATION_TYPE = [
  // Transactions
  "transaction_created",
  "transaction_anomaly",

  // AI
  "ai_insight",
  "ai_weekly_report",
  "ai_coach_response",

  // Splits
  "split_invite",
  "split_paid",
  "split_settled",
  "split_reminder",

  // Vaults
  "vault_milestone",
  "vault_contribution",
  "vault_invite",
  "vault_invite_accepted",

  // Accounts
  "account_connected",
  "account_disconnected",
  "account_sync_failed",

  // Budgets
  "budget_threshold",

  // Subscriptions
  "subscription_renewed",
  "subscription_expiring",
  "subscription_cancelled",

  // Security
  "security_alert",

  // System
  "system_maintenance",
  "system_welcome",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[number];

// ── Core Notification Event (what gets queued via BullMQ)
export type NotificationEvent =
  | { type: "transaction_created"; payload: TransactionCreatedPayload }
  | { type: "transaction_anomaly"; payload: TransactionAnomalyPayload }
  | { type: "ai_insight"; payload: AiInsightPayload }
  | { type: "ai_weekly_report"; payload: AiWeeklyReportPayload }
  | { type: "ai_coach_response"; payload: AiCoachResponsePayload }
  | { type: "split_invite"; payload: SplitInvitePayload }
  | { type: "split_paid"; payload: SplitPaidPayload }
  | { type: "split_settled"; payload: SplitSettledPayload }
  | { type: "split_reminder"; payload: SplitReminderPayload }
  | { type: "vault_milestone"; payload: VaultMilestonePayload }
  | { type: "vault_contribution"; payload: VaultContributionPayload }
  | { type: "vault_invite"; payload: VaultInvitePayload }
  | { type: "account_connected"; payload: AccountConnectedPayload }
  | { type: "account_disconnected"; payload: AccountDisconnectedPayload }
  | { type: "account_sync_failed"; payload: AccountSyncFailedPayload }
  | { type: "budget_threshold"; payload: BudgetThresholdPayload }
  | { type: "subscription_renewed"; payload: SubscriptionRenewedPayload }
  | { type: "subscription_expiring"; payload: SubscriptionExpiringPayload }
  | { type: "subscription_cancelled"; payload: SubscriptionCancelledPayload }
  | { type: "system_maintenance"; payload: SystemMaintenancePayload }
  | { type: "system_welcome"; payload: SystemWelcomePayload };

// ── Payload Types
export interface TransactionCreatedPayload {
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  description?: string;
}

export interface TransactionAnomalyPayload {
  userId: string;
  transactionId: string;
  amount: number;
  merchant: string;
  score: number;
  reason: string;
}

export interface BudgetThresholdPayload {
  userId: string;
  budgetId: string;
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

export interface AccountConnectedPayload {
  userId: string;
  accountId: string;
  bankName: string;
  accountType: string;
}

export interface AccountDisconnectedPayload {
  userId: string;
  accountId: string;
  bankName: string;
}

export interface AccountSyncFailedPayload {
  userId: string;
  accountId: string;
  bankName: string;
  error: string;
}

export interface SplitInvitePayload {
  userId: string;
  splitId: string;
  invitedBy: string;
  invitedByName: string;
  amount: number;
  currency: string;
  title: string;
}

export interface SplitPaidPayload {
  userId: string;
  splitId: string;
  payerName: string;
  amount: number;
  title: string;
}

export interface SplitSettledPayload {
  userId: string;
  splitId: string;
  title: string;
  settledBy: string;
}

export interface SplitReminderPayload {
  userId: string;
  splitId: string;
  title: string;
  amountOwed: number;
  currency: string;
  dueDate?: string;
}

export interface VaultMilestonePayload {
  userId: string;
  vaultId: string;
  vaultName: string;
  milestone: 25 | 50 | 75 | 100;
  current: number;
  target: number;
  currency: string;
}

export interface VaultContributionPayload {
  userId: string;
  vaultId: string;
  vaultName: string;
  contributorName: string;
  amount: number;
  currency: string;
}

export interface VaultInvitePayload {
  userId: string;
  vaultId: string;
  vaultName: string;
  invitedBy: string;
}

export interface AiInsightPayload {
  userId: string;
  insightId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: string;
}

export interface AiWeeklyReportPayload {
  userId: string;
  reportId: string;
  summary: string;
  healthScore: number;
  topCategory: string;
  totalSpent: number;
}

export interface AiCoachResponsePayload {
  userId: string;
  sessionId: string;
  message: string;
  topic: string;
}

export interface SubscriptionExpiringPayload {
  userId: string;
  daysLeft: number;
  plan: string;
  renewalDate: string;
}

export interface SubscriptionRenewedPayload {
  userId: string;
  plan: string;
  renewalDate: string;
  amount: number;
}

export interface SubscriptionCancelledPayload {
  userId: string;
  plan: string;
  endDate: string;
}

export interface SystemMaintenancePayload {
  userId: string;
  scheduledAt: string;
  durationMinutes: number;
  message: string;
}

export interface SystemWelcomePayload {
  userId: string;
  userName: string;
}

// ── Notification Job (BullMQ queue payload)
export type NotificationJob = {
  event: NotificationEvent;
  priority?: number;
  delayMs?: number;
};

// ── App Notification (DB record + API response)
export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data: {
    actionUrl: string;
    relatedId?: string;
    relatedType?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  readAt: Date | null;
  pushSentAt: Date | null;
  pushDelivered: boolean;
  emailSentAt: Date | null;
  emailDelivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Notification Preferences
export interface NotificationPreferences {
  paymentAlerts: boolean;
  budgetAlerts: boolean;
  splitNotifs: boolean;
  vaultUpdates: boolean;
  weeklyReport: boolean;
  anomalyAlerts: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

// ── Notification Data (JSONB in DB)
export const notificationDataSchema = z
  .object({
    actionUrl: z.string().optional(),
    relatedId: z.string().optional(),
    relatedType: z
      .enum(["transaction", "split", "vault", "account", "insight"])
      .optional(),
  })
  .catchall(z.unknown());

export type NotificationData = z.infer<typeof notificationDataSchema>;

// ── Create Notification Input Schema
export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPE),
  category: z.enum(NOTIFICATION_CATEGORY),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  data: notificationDataSchema.optional(),
  isRead: z.boolean().optional(),
  readAt: z.date().nullable().optional(),
  pushSentAt: z.date().nullable().optional(),
  pushDelivered: z.boolean().optional(),
  emailSentAt: z.date().nullable().optional(),
  emailDelivered: z.boolean().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ── Filter / List Input
export const notificationsFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  search: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
  category: z.enum([...NOTIFICATION_CATEGORY, "all" as const]).default("all"),
  status: z.enum(["all", "read", "unread"]).default("all"),
});

export type NotificationsFilterInput = z.infer<
  typeof notificationsFilterSchema
>;

// ── Paginated Response
export interface PaginatedNotifications {
  items: AppNotification[];
  nextCursor: string | null;
}

// ── Device Token
export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  deviceName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const registerDeviceSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
  deviceName: z.string().max(200).optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

// ── Mark Read / Unread Input
export const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;

// ── Update Preferences Input
export const updatePreferencesSchema = z.object({
  transactionAlerts: z.boolean().optional(),
  accountAlerts: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  insightsAlerts: z.boolean().optional(),
  coachAlerts: z.boolean().optional(),
  splitNotifs: z.boolean().optional(),
  vaultUpdates: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
