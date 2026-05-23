import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categoryEnum } from "./transactions";

// Inlined for drizzle-kit CJS compatibility — source of truth is @neuralpay/types
export const insightTypeEnum = pgEnum("insight_type", [
  "anomaly",
  "opportunity",
  "trend",
  "saving",
  "warning",
]);
export const insightSeverityEnum = pgEnum("insight_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const chatContextTypeEnum = pgEnum("chat_context_type", [
  "insight",
  "transaction",
  "budget",
  "vault",
  "split",
  "general",
]);
export const topicEnum = pgEnum("topic", [
  "budgeting",
  "spending",
  "savings",
  "general",
]);
export const roleEnum = pgEnum("role", ["user", "assistant"]);

// // Compile-time drift guards
// type _CheckInsightType =
//   (typeof insightTypeEnum.enumValues)[number] extends InsightType
//     ? true
//     : never;
// type _CheckSeverity =
//   (typeof insightSeverityEnum.enumValues)[number] extends InsightSeverity
//     ? true
//     : never;
// type _CheckContext =
//   (typeof chatContextTypeEnum.enumValues)[number] extends ChatContextType
//     ? true
//     : never;
// type _CheckTopic = (typeof topicEnum.enumValues)[number] extends Topic
//   ? true
//   : never;
// type _CheckRole = (typeof roleEnum.enumValues)[number] extends Role
//   ? true
//   : never;
// const _1: _CheckInsightType = true;
// const _2: _CheckSeverity = true;
// const _3: _CheckContext = true;
// const _4: _CheckTopic = true;
// const _5: _CheckRole = true;

export const insights = pgTable("insights_spending", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: insightTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: insightSeverityEnum("severity"),
  category: categoryEnum("category"),
  data: text("data"),
  readAt: timestamp("read_at"),
  dismissedAt: timestamp("dismissed_at"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  topic: topicEnum("topic").default("general"),
  contextType: chatContextTypeEnum("context_type").default("general"),
  contextId: text("context_id"),
  isActive: boolean("is_active").default(true),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatSessionRecord = typeof chatSessions.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessageRecord = typeof chatMessages.$inferSelect;

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  queryCount: integer("query_count").notNull().default(0),
  tokenCount: integer("token_count").notNull().default(0),
  lastQueryAt: timestamp("last_query_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AIUsageRecord = typeof aiUsage.$inferSelect;
