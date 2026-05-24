import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

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

export const customCategories = pgTable(
  "custom_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon"), // lucide icon name e.g. "coffee"
    color: text("color"), // hex color e.g. "#FF5733"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("custom_categories_user_idx").on(t.userId)],
);
