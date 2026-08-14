import { tool } from "ai";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { z } from "zod";
import {
  fetchCategorySpending,
  fetchTotalSpending,
  fetchTrendSpending,
} from "../../lib/spending";
import { datetimeInput } from "../lib/lean-schemas";

const CATEGORIES = [
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
] as const;

const PERIODS = ["7d", "30d", "90d", "this_month", "last_month", "custom"] as const;
type Period = (typeof PERIODS)[number];

type ResolvedPeriod =
  | { kind: "month"; startDate: Date; endDate: Date }
  | { kind: "span"; spanDays: number; startDate: Date; endDate: Date }
  | { kind: "custom"; spanMs: number; startDate: Date; endDate: Date };

function resolvePeriod(
  period: Period,
  dateFrom?: string,
  dateTo?: string,
): ResolvedPeriod {
  const now = new Date();
  switch (period) {
    case "7d":
    case "30d":
    case "90d": {
      const days = period === "7d" ? 6 : period === "90d" ? 89 : 29;
      return {
        kind: "span",
        spanDays: days + 1,
        startDate: startOfDay(subDays(now, days)),
        endDate: endOfDay(now),
      };
    }
    case "this_month":
      return {
        kind: "month",
        startDate: startOfMonth(now),
        endDate: endOfDay(now),
      };
    case "last_month": {
      const base = subMonths(now, 1);
      return {
        kind: "month",
        startDate: startOfMonth(base),
        endDate: endOfMonth(base),
      };
    }
    case "custom": {
      if (!dateFrom || !dateTo) {
        throw new Error("dateFrom and dateTo are required when period is 'custom'");
      }
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      return { kind: "custom", spanMs: +endDate - +startDate, startDate, endDate };
    }
  }
}

function previousWindow(p: ResolvedPeriod): { startDate: Date; endDate: Date } {
  if (p.kind === "month") {
    const base = subMonths(p.startDate, 1);
    return { startDate: startOfMonth(base), endDate: endOfMonth(base) };
  }
  if (p.kind === "custom") {
    const endDate = new Date(+p.startDate - 1);
    return { startDate: new Date(+endDate - p.spanMs), endDate };
  }
  const endDate = startOfDay(subDays(p.startDate, 1));
  return { startDate: startOfDay(subDays(endDate, p.spanDays - 1)), endDate };
}

export function buildGetSpendingAnalysisTool(userId: string) {
  return tool({
    description:
      "Compute spending analytics for a period — totals, per-category breakdown, or a day/week trend — with optional comparison to the previous period. Use for 'what do I spend most on' or 'this month vs last month'. Returns aggregates only.",
    inputSchema: z.object({
      period: z.enum(PERIODS).default("30d"),
      dateFrom: datetimeInput()
        .optional()
        .describe("Required when period=custom"),
      dateTo: datetimeInput()
        .optional()
        .describe("Required when period=custom"),
      groupBy: z.enum(["category", "day", "week"]).default("category"),
      comparePrevious: z.boolean().default(true),
      limit: z.number().int().min(1).max(20).default(10),
      category: z.enum(CATEGORIES).optional(),
    }),
    execute: async ({
      period,
      dateFrom,
      dateTo,
      groupBy,
      comparePrevious,
      limit,
      category,
    }) => {
      const resolved = resolvePeriod(period, dateFrom, dateTo);
      const { startDate, endDate } = resolved;

      let totalSpent = 0;
      let breakdown: Record<string, unknown>;

      if (groupBy === "category") {
        const rows = await fetchCategorySpending(userId, {
          startDate,
          endDate,
          includeCount: true,
          category,
        });
        totalSpent = rows.reduce((sum, r) => sum + r.total, 0);
        breakdown = {
          byCategory: rows.slice(0, limit).map((r) => ({
            category: r.category,
            totalSpent: r.total,
            count: r.count ?? 0,
            percentage:
              totalSpent > 0 ? Math.round((r.total / totalSpent) * 1000) / 10 : 0,
          })),
        };
      } else {
        const rows = await fetchTrendSpending(
          userId,
          startDate,
          endDate,
          groupBy,
          category,
        );
        totalSpent = rows.reduce((sum, r) => sum + r.value, 0);
        const series = rows
          .slice(0, limit)
          .map((r) => ({ label: r.label, totalSpent: r.value }));
        breakdown =
          groupBy === "week" ? { byWeek: series } : { byDay: series };
      }

      let previousPeriod = null;
      if (comparePrevious) {
        const prev = previousWindow(resolved);
        const prevTotal = await fetchTotalSpending(
          userId,
          prev.startDate,
          prev.endDate,
          category,
        );
        previousPeriod = {
          totalSpent: prevTotal,
          percentChange:
            prevTotal > 0
              ? Math.round(((totalSpent - prevTotal) / prevTotal) * 1000) / 10
              : null,
        };
      }

      return {
        period,
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        totalSpent,
        ...breakdown,
        previousPeriod,
      };
    },
  });
}
