import type { Period } from "@/modules/dashboard/types";
import {
  format,
  formatDistanceToNow,
  isThisYear,
  isToday,
  isYesterday,
} from "date-fns";
import { type DateRange } from "react-day-picker";

function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date);
}

// ── Currency ───────────────────────────────────────────────

/**
 * "$1,234.56" — always absolute value
 * @example formatAmount(1234.56) → "$1,234.56"
 * @example formatAmount(-50) → "$50.00"
 */
export function formatAmount(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

/**
 * "$1,234.56" with sign — use for credits/debits
 * @example formatAmountSigned(1234.56)  → "+$1,234.56"
 * @example formatAmountSigned(-50)      → "-$50.00"
 */
export function formatAmountSigned(amount: number, currency = "USD"): string {
  const formatted = formatAmount(amount, currency);
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

// ── Relative time ──────────────────────────────────────────

/**
 * Human-friendly relative time — use in chat messages, activity feeds, notifications
 * @example formatRelative(new Date())          → "Just now"
 * @example formatRelative(fiveMinutesAgo)      → "5m ago"
 * @example formatRelative(threeHoursAgo)       → "3h ago"
 * @example formatRelative(twoDaysAgo)          → "2d ago"
 * @example formatRelative(twoWeeksAgo)         → "Jun 3"
 * @example formatRelative(lastYear)            → "Jun 3, 2024"
 */
export function formatRelative(date: Date | string | number): string {
  const d = toDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return isThisYear(d) ? format(d, "MMM d") : format(d, "MMM d, yyyy");
}

/**
 * "X minutes/hours/days ago" — verbose version, use in tooltips
 * @example formatRelativeVerbose(fiveMinutesAgo) → "5 minutes ago"
 */
export function formatRelativeVerbose(date: Date | string | number): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}

// ── Absolute dates ─────────────────────────────────────────

/**
 * "May 6" or "May 6, 2024" — use in transaction lists, history tables
 * Omits year when it's the current year.
 * @example formatDate(today)    → "Jun 11"
 * @example formatDate(lastYear) → "Jun 11, 2024"
 */
export function formatDate(date: Date | string | number): string {
  const d = toDate(date);
  return isThisYear(d) ? format(d, "MMM d") : format(d, "MMM d, yyyy");
}

/**
 * "May 6, 2024" — always includes year, use in receipts, exports, statements
 */
export function formatDateFull(date: Date | string | number): string {
  return format(toDate(date), "MMMM d, yyyy");
}

/**
 * "May 6, 3:45 PM" or "May 6, 2024, 3:45 PM" — use in transaction details, audit logs
 */
export function formatDateTime(date: Date | string | number): string {
  const d = toDate(date);
  return isThisYear(d)
    ? format(d, "MMM d, h:mm a")
    : format(d, "MMM d yyyy, h:mm a");
}

/**
 * "Today", "Yesterday", "May 6" — use in chat session list, grouped message headers
 * @example formatDateSmart(today)     → "Today"
 * @example formatDateSmart(yesterday) → "Yesterday"
 * @example formatDateSmart(lastWeek)  → "Jun 3"
 */
export function formatDateSmart(date: Date | string | number): string {
  const d = toDate(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDate(d);
}

/**
 * "3:45 PM" — time only, use alongside a date label
 */
export function formatTime(date: Date | string | number): string {
  return format(toDate(date), "h:mm a");
}

/**
 * "05/06/2024" — numeric, use in forms, date inputs
 */
export function formatDateNumeric(date: Date | string | number): string {
  return format(toDate(date), "MM/dd/yyyy");
}

/**
 * "2024-06-11" — ISO date, use for API params, filenames, sorting
 */
export function formatDateISO(date: Date | string | number): string {
  return format(toDate(date), "yyyy-MM-dd");
}

// ── Percent ────────────────────────────────────────────────

/**
 * @example formatPercent(12.5)    → "12.50%"
 * @example formatPercent(12.5, 0) → "13%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
