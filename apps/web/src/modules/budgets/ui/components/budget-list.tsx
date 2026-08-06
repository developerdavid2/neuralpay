"use client";

import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { PiggyBank } from "lucide-react";
import type { BudgetsFilterInput } from "@neuralpay/types";
import { useBudgetsList } from "../../hooks/queries/use-budgets";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";
import { BudgetCard } from "./budget-card";

export function BudgetList({ filters }: { filters: BudgetsFilterInput }) {
  const { budgets } = useBudgetsList(filters);
  const { onOpenView } = useBudgetDrawer();

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <PiggyBank className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">No budgets yet</p>
          <p className="text-sm text-muted-foreground">
            Create a budget to start tracking your spending against limits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
      {budgets.map((b) => (
        <BudgetCard
          key={b.id}
          budget={b}
          onClick={() => onOpenView(b.id, b)}
        />
      ))}
    </div>
  );
}

export function BudgetListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[150px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
