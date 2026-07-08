import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const notificationType = pgEnum("notification_type", [
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
]);

export const notificationCategory = pgEnum("notification_category", [
  "transaction",
  "budget",
  "split",
  "vault",
  "account",
  "security",
  "system",
  "ai",
  "subscription",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationType("type").notNull(),
  category: notificationCategory("category").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  data: jsonb("data").$type<{
    actionUrl?: string;
    relatedId?: string;
    relatedType?: "transaction" | "split" | "vault" | "account" | "insight";
    [key: string]: unknown;
  }>(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  pushSentAt: timestamp("push_sent_at"),
  pushDelivered: boolean("push_delivered").default(false),
  // In your schema
  seq: integer("seq").generatedAlwaysAsIdentity(),
  emailSentAt: timestamp("email_sent_at"),
  emailDelivered: boolean("email_delivered").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const devicePlatformEnum = pgEnum("device_platform", [
  "ios",
  "android",
  "web",
]);

export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: devicePlatformEnum("platform").notNull(),
    deviceName: varchar("device_name", { length: 100 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [unique("device_tokens_token_unique").on(t.token)],
);

export const notificationPreferences = pgTable("notification_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  transactionAlerts: boolean("transaction_alerts").default(true),
  accountAlerts: boolean("account_alerts").default(true),
  insightsAlerts: boolean("insights_alerts").default(true),
  coachAlerts: boolean("coach_alerts").default(true),
  budgetAlerts: boolean("budget_alerts").default(true),
  splitNotifs: boolean("split_notifs").default(true),
  vaultUpdates: boolean("vault_updates").default(true),
  weeklyReport: boolean("weekly_report").default(true),
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
