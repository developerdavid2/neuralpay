import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createSelectSchema } from "drizzle-zod";

// Enums
export const accountTypeEnum = pgEnum("account_type", [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "debit",
  "credit",
]);
export const TRANSACTION_TYPE = transactionTypeEnum.enumValues;

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "successful",
  "refunded",
  "reversed",
  "failed",
]);
export const TRANSACTION_STATUS = transactionStatusEnum.enumValues;

export const categoryEnum = pgEnum("category", [
  "food_dining",
  "utilities",
  "rent",
  "transport",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "transfer",
  "income",
  "investment",
  "subscriptions",
  "groceries",
  "other",
]);
export const TRANSACTION_CATEGORY = categoryEnum.enumValues;

// Accounts table
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  source: text("source").notNull(), // "plaid", "mono", "manual"
  sourceItemId: text("source_item_id"),
  sourceAccountId: text("source_account_id"), //  plaid's account_id or mono's accountId
  accessToken: text("access_token"), // encrypted, needed for sync
  cursor: text("cursor"), // Plaid incremental sync cursor
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  balance: decimal("balance", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  maskedNumber: text("masked_number"),
  bankName: text("bank_name"),
  isVerified: boolean("is_verified").default(false),
  lastSync: timestamp("last_sync"),
  status: text("status").default("active"), //  active, disconnected, needs_update
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AccountRecord = typeof bankAccounts.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("successful"),
  category: categoryEnum("category"),
  merchant: text("merchant"),
  date: timestamp("date").notNull(),
  plaidTxId: text("plaid_tx_id").unique(),
  monoTxId: text("mono_tx_id").unique(),
  isAnomaly: boolean("is_anomaly").default(false),
  anomalyScore: decimal("anomaly_score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const transactionSchema = createSelectSchema(transactions);
export type TransactionRecord = typeof transactions.$inferSelect;

// Tags
export const transactionTags = pgTable("transaction_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6C63FF"),
});

export const transactionTagMapping = pgTable(
  "transaction_tag_mapping",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => transactionTags.id),
  },
  (t) => [primaryKey({ columns: [t.transactionId, t.tagId] })],
);

// Budgets
export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  category: categoryEnum("category").notNull(),
  limitAmount: decimal("limit_amount", { precision: 18, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  alertThreshold: integer("alert_threshold").default(80),
  resetDay: integer("reset_day").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
