"use client";

import { MonthYearPicker } from "@/components/month-year-picker";
import { formatAmount } from "@/lib/utils";
import { Button } from "@orra/ui/components/button";
import { Skeleton } from "@orra/ui/components/skeleton";
import { cn } from "@orra/ui/lib/utils";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBudgetMonthlyStats } from "../../hooks/queries/use-budget-monthly-stats";

interface BudgetMonthlyStatsCardsProps {
  month: number;
  year: number;
}

export function BudgetMonthlyStatsCards({
  month,
  year,
}: BudgetMonthlyStatsCardsProps) {
  const { data: stats } = useBudgetMonthlyStats(month, year);
  const router = useRouter();
  const now = new Date();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();
  const currentValue = new Date(year, month - 1, 1);

  // Writes only the stats scope so navigating the summary never disturbs the
  // calendar or list, and preserves every other param (filters, view, etc.).
  const navigate = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("statsMonth", String(newMonth));
    params.set("statsYear", String(newYear));
    router.push(`?${params.toString()}`);
  };

  const cards = [
    {
      label: "Total Budgeted",
      value: formatAmount(stats.totalBudgeted),
      icon: Wallet,
      accent: "text-main",
      iconBg: "bg-main/10",
    },
    {
      label: "Total Spent",
      value: formatAmount(stats.totalSpent),
      icon: TrendingDown,
      accent: "text-destructive",
      iconBg: "bg-destructive/10",
    },
    {
      label: "Savings Rate",
      value: `${stats.savingsRate}%`,
      icon: PiggyBank,
      accent: "text-[#0EA5A0]",
      iconBg: "bg-[#0EA5A0]/10",
    },
    {
      label: "Needs Attention",
      value: `${stats.needsAttention.count}`,
      sub: `${stats.needsAttention.onTrackCount} on track · ${stats.needsAttention.overBudgetCount} over`,
      icon: AlertTriangle,
      accent: "text-amber-600",
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {stats.currentMonth}
            {!isCurrentMonth && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (past)
              </span>
            )}
          </h2>
          {isCurrentMonth && (
            <span className="rounded-full bg-main/10 px-2 py-0.5 text-xs font-medium text-main">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigate(prevMonth, prevYear)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <MonthYearPicker
            value={currentValue}
            onChange={(date) => {
              navigate(date.getMonth() + 1, date.getFullYear());
            }}
            maxYear={now.getFullYear()}
          />

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isCurrentMonth}
            onClick={() => navigate(nextMonth, nextYear)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-muted bg-card p-4 shadow-sm",
              !isCurrentMonth && "opacity-80",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {c.label}
              </span>
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  c.iconBg,
                )}
              >
                <c.icon className={cn("size-4", c.accent)} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {c.value}
              </span>
              {c.sub && (
                <span className="text-xs text-muted-foreground">{c.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetMonthlyStatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-26 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
