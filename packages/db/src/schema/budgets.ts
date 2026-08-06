import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { bankAccounts } from "./accounts";
import { categoryEnum } from "./categories";

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: categoryEnum("category").notNull(),
    limitAmount: decimal("limit_amount", { precision: 18, scale: 2 }).notNull(),
    // ── Legacy period model — still read by TransactionsService.getSpendingOverview.
    // Derived from `startDate` on write so the spending overview keeps working.
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    alertThreshold: integer("alert_threshold").default(80),
    resetDay: integer("reset_day").default(1),
    // ── Calendar model — powers the budgets UI (name, color, explicit range)
    name: text("name"),
    description: text("description"),
    color: text("color"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("budget_user_idx").on(t.userId),
    index("budget_user_active_idx").on(t.userId, t.isActive),
    index("budget_user_period_idx").on(t.userId, t.year, t.month),
  ],
);

// ── Optional account scoping. A budget with no rows here tracks all accounts.
export const budgetAccounts = pgTable(
  "budget_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccounts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("budget_accounts_budget_idx").on(t.budgetId),
    index("budget_accounts_account_idx").on(t.bankAccountId),
  ],
);
