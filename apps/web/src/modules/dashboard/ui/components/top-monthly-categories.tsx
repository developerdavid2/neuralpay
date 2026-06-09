"use client";

import { useState } from "react";

import { MonthYearPicker } from "@/components/month-year-picker";
import { useTopCategories } from "@/modules/transactions/hooks/use-transactions";
import { cn } from "@neuralpay/ui/lib/utils";
import { format, startOfMonth, subMonths } from "date-fns";
import { Receipt, TrendingUp } from "lucide-react";

// ── Skeleton ───────────────────────────────────────────────────────────────

export function TopCategoriesSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-7 w-28 rounded bg-muted animate-pulse" />
      </div>

      {/* Category bars skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-muted-foreground/30 animate-pulse"
                  style={{ width: `${100 - i * 15}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ date }: { date: Date }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Receipt className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        No spending in {format(date, "MMMM yyyy")}
      </p>
      <p className="text-xs text-muted-foreground max-w-50">
        Transactions will appear here once you start spending.
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function TopCategoriesCard() {
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfMonth(new Date()),
  );

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { data, isLoading } = useTopCategories({ month, year });

  // Bounds: max 12 months back from current
  const maxDate = startOfMonth(new Date());
  const minDate = startOfMonth(subMonths(new Date(), 11));

  if (isLoading) {
    return <TopCategoriesSkeleton />;
  }

  const hasData = data?.hasData ?? false;
  const categories = data?.categories ?? [];
  const totalSpending = data?.totalSpending ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Top Categories
          </h2>
          {hasData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ${totalSpending.toFixed(2)} total spending
            </p>
          )}
        </div>
        <MonthYearPicker
          value={selectedDate}
          onChange={setSelectedDate}
          minYear={2020} // ← explicit, not from Date object
          maxYear={new Date().getFullYear()}
        />
      </div>

      {/* Content */}
      {!hasData ? (
        <EmptyState date={selectedDate} />
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat, i) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-4 text-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium capitalize truncate">
                    {cat.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                    {cat.percentage}% · ${cat.total.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      i === 0 && "bg-primary",
                      i === 1 && "bg-primary/80",
                      i === 2 && "bg-primary/60",
                      i >= 3 && "bg-primary/40",
                    )}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
