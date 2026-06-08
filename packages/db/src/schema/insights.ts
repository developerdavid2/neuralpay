import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categoryEnum } from "./categories";

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
