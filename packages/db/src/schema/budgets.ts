import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { bankAccounts } from "./accounts";
import { categoryEnum } from "./categories";

export const budgetPeriods = pgEnum("budget_period", [
  "weekly",
  "monthly",
  "custom",
]);

export const budgetStatus = pgEnum("budget_status", [
  "on_track",
  "warning",
  "over",
]);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#6366f1"),
    limitAmount: decimal("limit_amount", { precision: 18, scale: 2 }).notNull(),
    period: budgetPeriods("period").notNull(),
    status: budgetStatus("status").default("on_track").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    alertThreshold: integer("alert_threshold").default(80).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    resetDay: integer("reset_day").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("budget_user_idx").on(t.userId),
    index("budget_user_active_idx").on(t.userId, t.isActive),
    index("budget_user_status_idx").on(t.userId, t.status),
    index("budget_user_period_idx").on(t.userId, t.year, t.month),
    index("budget_date_range_idx").on(t.startDate, t.endDate),
  ],
);

export const budgetCategories = pgTable(
  "budget_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    category: categoryEnum("category").notNull(),
    limitAmount: decimal("limit_amount", { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("budget_cat_budget_idx").on(t.budgetId),
    index("budget_cat_category_idx").on(t.category),
  ],
);

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
