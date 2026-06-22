import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const accountTypeEnum = pgEnum("account_type", [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "inactive",
]);

export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    subtype: text("subtype"),
    tags: text("tags").array().default([]).notNull(),
    bankName: text("bank_name"),
    maskedNumber: text("masked_number"),
    balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
    currency: text("currency").default("USD").notNull(),
    isManual: boolean("is_manual").default(true).notNull(),
    status: accountStatusEnum("status").default("active").notNull(),
    plaidItemId: text("plaid_item_id"),
    plaidAccountId: text("plaid_account_id"),
    monoAccountId: text("mono_account_id"),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("bank_accounts_user_idx").on(t.userId),
    index("bank_accounts_plaid_idx").on(t.plaidAccountId),
  ],
);
