import {
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
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
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    alertThreshold: integer("alert_threshold").default(80),
    resetDay: integer("reset_day").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("budget_user_idx").on(t.userId)],
);
