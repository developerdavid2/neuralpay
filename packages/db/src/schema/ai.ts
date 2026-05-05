import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const topicEnum = pgEnum("topic", [
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
  title: text("title"),
  topic: topicEnum("topic").default("general"),
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
