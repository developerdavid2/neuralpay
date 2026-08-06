"use client";

import { formatAmount } from "@/lib/utils";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  AlertTriangle,
  PiggyBank,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useBudgetSummary } from "../../hooks/queries/use-budget-summary";

export function BudgetSummaryCards() {
  const { summary } = useBudgetSummary();

  const cards = [
    {
      label: "Total Budgeted",
      value: formatAmount(summary.totalBudgeted),
      icon: Wallet,
      accent: "text-main",
      iconBg: "bg-main/10",
    },
    {
      label: "Total Spent",
      value: formatAmount(summary.totalSpent),
      icon: TrendingDown,
      accent: "text-destructive",
      iconBg: "bg-destructive/10",
    },
    {
      label: "Remaining",
      value: formatAmount(summary.totalRemaining),
      icon: PiggyBank,
      accent: "text-[#0EA5A0]",
      iconBg: "bg-[#0EA5A0]/10",
    },
    {
      label: "Needs Attention",
      value: `${summary.overCount + summary.warningCount}`,
      sub: `${summary.activeCount} active`,
      icon: AlertTriangle,
      accent: "text-amber-600",
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex flex-col gap-3 rounded-2xl border border-muted bg-card p-4 shadow-sm"
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
  );
}

export function BudgetSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
