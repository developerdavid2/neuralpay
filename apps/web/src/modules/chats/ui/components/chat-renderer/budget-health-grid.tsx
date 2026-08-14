"use client";

import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatAmount } from "@/lib/utils";
import { HEALTH_META } from "@/modules/budgets/constants";

interface BudgetHealthItem {
  id: string;
  name: string;
  limitAmount: number;
  totalSpent: number;
  percentUsed: number;
  status: "on_track" | "warning" | "over";
  daysRemaining: number;
}

export function BudgetHealthGrid({ data }: { data: BudgetHealthItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        No active budgets to show.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      {data.map((b) => {
        const meta = HEALTH_META[b.status];
        const pct = Math.min(b.percentUsed, 100);
        return (
          <div
            key={b.id}
            className="rounded-xl border border-border p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{b.name}</span>
              <Badge variant="outline" className={cn("shrink-0", meta.badge)}>
                {meta.label}
              </Badge>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", meta.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatAmount(b.totalSpent)} / {formatAmount(b.limitAmount)}
              </span>
              <span>{b.daysRemaining} days left</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
