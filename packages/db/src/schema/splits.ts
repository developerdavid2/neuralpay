import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categoryEnum } from "./categories";

export const splitStatusEnum = pgEnum("split_status", [
  "open",
  "settled",
  "cancelled",
]);

export const splits = pgTable("splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  category: categoryEnum("category").default("other"),
  paidById: text("paid_by_id").references(() => user.id),
  status: splitStatusEnum("status").default("open"),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const splitParticipants = pgTable("split_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  splitId: uuid("split_id")
    .notNull()
    .references(() => splits.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  guestName: text("guest_name"), // for non-registered participants
  guestEmail: text("guest_email"), // to send them a payment request
  shareAmount: decimal("share_amount", { precision: 18, scale: 2 }).notNull(),
  paid: boolean("paid").default(false),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const splitChatMessages = pgTable("split_chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  splitId: uuid("split_id")
    .notNull()
    .references(() => splits.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isSystemMessage: boolean("is_system_message").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
