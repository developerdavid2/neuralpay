import type { Period } from "@/modules/dashboard/types";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { type DateRange } from "react-day-picker";

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export function formatTransactionDate(date: Date | string): string {
  const d = new Date(date);

  if (isToday(d)) {
    return `Today at ${format(d, "h:mm a")}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, "h:mm a")}`;
  }

  // Within the last 6 days → "3 days ago"
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return formatDistanceToNow(d, { addSuffix: true });
  }

  // Older → "May 6" or "May 6, 2024"
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return format(d, sameYear ? "MMM d, h:mm a" : "MMM d yyyy, h:mm a");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d");
}

export function formatDateFull(date: Date | string): string {
  return format(new Date(date), "MMMM d, yyyy");
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function getPeriodDays(period: Period, dateRange?: DateRange): number {
  if (dateRange?.from && dateRange?.to) {
    return Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 30;
  }
}
