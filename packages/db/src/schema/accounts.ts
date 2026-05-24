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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "./auth";

export const accountTypeEnum = pgEnum("account_type", [
  "checking",
  "savings",
  "credit",
  "investment",
  "crypto",
]);

export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // user-defined: "My Ajo Group", "GTBank Salary"
    type: accountTypeEnum("type").notNull(), // structural: checking, savings, credit, investment, crypto
    subtype: text("subtype"), // user label: "Ajo", "FD", "Retirement", "Esusu"
    tags: text("tags").array().default([]).notNull(), // ["Nigeria", "Business", "Joint"]
    bankName: text("bank_name"),
    maskedNumber: text("masked_number"),
    balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
    currency: text("currency").default("USD").notNull(),
    isManual: boolean("is_manual").default(true).notNull(), // true = user-created, false = Plaid/Mono
    status: text("status").default("active").notNull(), // "active" | "disconnected" | "archived"
    // Plaid/Mono fields
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

export const bankAccountSelectSchema = createSelectSchema(bankAccounts);
export const bankAccountInsertSchema = createInsertSchema(bankAccounts);

export type BankAccountRecord = typeof bankAccounts.$inferSelect;
