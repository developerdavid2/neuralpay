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

export const chatContextTypeEnum = pgEnum("chat_context_type", [
  "insight",
  "transaction",
  "budget",
  "vault",
  "split",
  "general",
]);
export const topicTypeEnum = pgEnum("topic", [
  "budgeting",
  "spending",
  "savings",
  "general",
]);
export const roleEnum = pgEnum("role", ["user", "assistant"]);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  topic: topicTypeEnum("topic").default("general"),
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
