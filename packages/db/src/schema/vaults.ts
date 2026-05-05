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

export const vaultCategoryEnum = pgEnum("vault_category", [
  "vacation",
  "emergency",
  "down_payment",
  "education",
  "wedding",
  "other",
]);

export const vaults = pgTable("vaults", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 18, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  category: vaultCategoryEnum("category").default("other"),
  targetDate: timestamp("target_date"),
  color: text("color"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vaultMembers = pgTable("vault_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  vaultId: uuid("vault_id")
    .notNull()
    .references(() => vaults.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("contributor"), // owner, contributor
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const vaultContributions = pgTable("vault_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  vaultId: uuid("vault_id")
    .notNull()
    .references(() => vaults.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vaultInvitations = pgTable("vault_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  vaultId: uuid("vault_id")
    .notNull()
    .references(() => vaults.id, { onDelete: "cascade" }),
  invitedEmail: text("invited_email").notNull(),
  invitedById: text("invited_by_id")
    .notNull()
    .references(() => user.id),
  status: text("status").notNull().default("pending"),
  respondedAt: timestamp("responded_at"),
});
