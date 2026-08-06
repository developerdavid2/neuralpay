import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { BudgetHealth, BudgetPeriod } from "@neuralpay/types";

export const BUDGET_VIEW_MODES = ["calendar", "list"] as const;
export type BudgetViewMode = (typeof BUDGET_VIEW_MODES)[number];

export const HEALTH_META: Record<
  BudgetHealth,
  { label: string; color: string; bar: string; badge: string }
> = {
  on_track: {
    label: "On track",
    color: "text-emerald-600",
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  warning: {
    label: "Nearing limit",
    color: "text-amber-600",
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  over: {
    label: "Over budget",
    color: "text-red-600",
    bar: "bg-red-500",
    badge: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

// Given a period preset and an anchor date, return the [start, end] ISO range.
export function rangeForPeriod(
  period: BudgetPeriod,
  anchor: Date,
): { startDate: string; endDate: string } {
  if (period === "weekly") {
    return {
      startDate: startOfWeek(anchor, { weekStartsOn: 1 }).toISOString(),
      endDate: endOfWeek(anchor, { weekStartsOn: 1 }).toISOString(),
    };
  }
  if (period === "monthly") {
    return {
      startDate: startOfMonth(anchor).toISOString(),
      endDate: endOfMonth(anchor).toISOString(),
    };
  }
  // custom — default to a one-month window the user can adjust
  return {
    startDate: startOfMonth(anchor).toISOString(),
    endDate: endOfMonth(anchor).toISOString(),
  };
}

export function nextPeriodAnchor(
  period: BudgetPeriod,
  anchor: Date,
  dir: 1 | -1,
): Date {
  return period === "weekly"
    ? addWeeks(anchor, dir)
    : addMonths(anchor, dir);
}
