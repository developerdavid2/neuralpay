import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { bankAccounts } from "./accounts";
import { user } from "./auth";
import { categoryEnum, customCategories } from "./categories";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "debit",
  "credit",
]);
export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "successful",
  "refunded",
  "reversed",
  "failed",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    type: transactionTypeEnum("type").notNull(),
    status: transactionStatusEnum("status").default("successful"),
    // Category is either a system enum OR a custom category (never both)
    category: categoryEnum("category"),
    customCategoryId: uuid("custom_category_id").references(
      () => customCategories.id,
      { onDelete: "set null" },
    ),
    merchant: text("merchant"),
    date: timestamp("date").notNull(),
    isAnomaly: boolean("is_anomaly").default(false).notNull(),
    anomalyScore: numeric("anomaly_score", { precision: 5, scale: 4 }),
    notes: text("notes"),
    // Source tracking
    isManual: boolean("is_manual").default(false).notNull(), // manually added
    plaidTxId: text("plaid_tx_id").unique(),
    monoTxId: text("mono_tx_id").unique(),
    csvImportId: uuid("csv_import_id").references(() => csvImports.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("transactions_user_idx").on(t.userId),
    index("transactions_account_idx").on(t.bankAccountId),
    index("transactions_date_idx").on(t.date),
    index("transactions_category_idx").on(t.category),
    index("transactions_anomaly_idx").on(t.isAnomaly),
  ],
);

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

export const csvImports = pgTable(
  "csv_imports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    totalRows: integer("total_rows").default(0).notNull(),
    importedRows: integer("imported_rows").default(0).notNull(),
    skippedRows: integer("skipped_rows").default(0).notNull(),
    status: text("status").default("pending").notNull(), // "pending" | "processing" | "completed" | "failed"
    errorMessage: text("error_message"),
    // Column mapping saved so user can reuse it next time
    columnMapping: text("column_mapping"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("csv_imports_user_idx").on(t.userId)],
);
