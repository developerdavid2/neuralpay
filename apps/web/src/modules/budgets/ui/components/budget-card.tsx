"use client";

import { formatAmount } from "@/lib/utils";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/modules/dashboard/constants";
import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";
import { Package } from "lucide-react";
import type { Budget } from "@neuralpay/types";
import { HEALTH_META } from "../../constants";

export function BudgetCard({
  budget,
  onClick,
}: {
  budget: Budget;
  onClick?: () => void;
}) {
  const Icon = CATEGORY_ICONS[budget.category] ?? Package;
  const health = HEALTH_META[budget.status];
  const pct = Math.min(budget.percentUsed, 100);
  const accent = budget.color ?? "#6366f1";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col gap-3 rounded-2xl border border-muted bg-card p-4 text-left shadow-sm transition hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
          >
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {budget.name ?? CATEGORY_LABELS[budget.category] ?? budget.category}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {CATEGORY_LABELS[budget.category] ?? budget.category}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0", health.badge)}>
          {health.label}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold tabular-nums">
            {formatAmount(budget.spent)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            of {formatAmount(Number(budget.limitAmount))}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", health.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn("font-medium", health.color)}>
            {budget.percentUsed}% used
          </span>
          <span>
            {budget.remaining >= 0
              ? `${formatAmount(budget.remaining)} left`
              : `${formatAmount(Math.abs(budget.remaining))} over`}
          </span>
        </div>
      </div>
    </button>
  );
}
