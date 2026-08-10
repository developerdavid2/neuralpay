"use client";

import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useBudgetsList } from "../../hooks/queries/use-budgets";
import type { BudgetQueryState } from "../../types";
import { BudgetMonthSection } from "./budget-month-section";

interface BudgetListProps {
  queryState: BudgetQueryState;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onAllBudgetIdsChange: (ids: string[]) => void;
  onDeleteBudget?: (id: string) => void;
  onAskCoach?: (
    budget: Parameters<typeof BudgetMonthSection>[0]["budgets"][number],
  ) => void;
}

export function BudgetList({
  queryState,
  selectedIds,
  onSelect,
  onAllBudgetIdsChange,
  onDeleteBudget,
  onAskCoach,
}: BudgetListProps) {
  const { limit, search, statuses, isActive, period, month, year, sortField, sortDir } =
    queryState;
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useBudgetsList({
      limit,
      search: search || undefined,
      status: statuses.length > 0 ? statuses : undefined,
      isActive,
      period,
      month,
      year,
      sortField,
      sortDir,
    });

  const budgets = useMemo(() => {
    const flat = data?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Map<string, (typeof flat)[number]>();
    for (const b of flat) seen.set(b.id, b);
    return Array.from(seen.values());
  }, [data]);

  useEffect(() => {
    onAllBudgetIdsChange(budgets.map((b) => b.id) || []);
  }, [budgets, onAllBudgetIdsChange]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; date: Date; budgets: typeof budgets }
    >();

    for (const budget of budgets) {
      const anchor = budget.startDate ?? new Date(budget.createdAt);
      const key = format(anchor, "yyyy-MM");
      const existing = map.get(key);

      if (existing) {
        existing.budgets.push(budget);
      } else {
        map.set(key, {
          key,
          date: new Date(anchor.getFullYear(), anchor.getMonth()),
          budgets: [budget],
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [budgets]);

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Sparkles className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">No active budgets</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create a new budget to begin
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pb-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        <div className="space-y-0">
          {groups.map((group) => (
            <BudgetMonthSection
              key={group.key}
              anchorDate={group.date}
              budgets={group.budgets}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onDeleteBudget={onDeleteBudget}
              onAskCoach={onAskCoach}
            />
          ))}
        </div>

        <InfiniteScroll
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export function BudgetListSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="pb-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        {/* Month section header */}
        <div className="sticky top-0 z-20 bg-accent/50 border-y border-border px-4 py-3 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-3 px-6 py-2.5">
            <Skeleton className="size-4 rounded-sm shrink-0" />
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>

        {/* Budget card rows */}
        <div className="flex flex-col pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mx-6 py-1.5 px-4">
              <Skeleton className="size-4 rounded-sm shrink-0" />
              <div className="flex-1 flex flex-row items-start gap-3 border border-border/50 rounded-xl px-5 py-4">
                <Skeleton className="size-10 rounded-xl ml-2 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
