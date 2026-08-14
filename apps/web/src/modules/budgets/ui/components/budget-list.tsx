"use client";

import type { Budget } from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Sparkles } from "lucide-react";
import { useCallback, useEffect } from "react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useAskAICoach } from "@/hooks/mutations/use-ask-ai-coach";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetsList } from "../../hooks/queries/use-budgets";
import { useBudgetDrawer } from "../../hooks/store/use-budget-drawer";
import { useBudgetPendingSelectors } from "../../hooks/store/use-budget-pending";
import {
  useBudgetSelectionActions,
  useSelectedArray,
  useSelectedIds,
} from "../../hooks/store/use-budget-selection";
import { useBudgetUrlSync } from "../../hooks/use-budget-url-sync";
import type { BudgetQueryState } from "../../types";
import { BudgetMonthSection } from "./budget-month-section";

interface BudgetListProps {
  queryState: BudgetQueryState;
}

export function BudgetList({ queryState }: BudgetListProps) {
  const {
    limit,
    search,
    statuses,
    isActive,
    period,
    month,
    year,
    sortField,
    sortDir,
  } = queryState;

  const {
    budgets,
    groups,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useBudgetsList({
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

  const selectedIds = useSelectedIds();
  const { setUrl } = useBudgetUrlSync();
  const { onOpenView, onOpenEdit } = useBudgetDrawer();
  const { handleDelete: runDelete } = useBudgetMutations();
  const { isRowPending, isBatchDeleting } = useBudgetPendingSelectors();
  const { onSelect, onSelectMany, setAllBudgetIds } =
    useBudgetSelectionActions();
  const { askAboutContext } = useAskAICoach();
  const [ConfirmDialog, confirm] = useConfirm();

  useEffect(() => {
    setAllBudgetIds(budgets.map((b) => b.id) || []);
  }, [budgets, setAllBudgetIds]);

  const handleView = useCallback(
    (id: string) => {
      onOpenView(id);
      setUrl("view", id);
    },
    [onOpenView, setUrl],
  );

  const handleEdit = useCallback(
    (id: string) => {
      onOpenEdit(id);
      setUrl("edit", id);
    },
    [onOpenEdit, setUrl],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "Delete budget",
        message:
          "Are you sure you want to delete this budget? This action cannot be undone.",
        variant: "destructive",
        confirmLabel: "Delete",
      });
      if (!ok) return;
      await runDelete(id);
    },
    [confirm, runDelete],
  );

  const handleAskCoach = (budget: Budget) => {
    if (!budget) return;
    askAboutContext(
      "budget",
      budget.id,
      `Tell me about my "${budget.name}" budget — how am I tracking against it?`,
    );
  };

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
      <ConfirmDialog />
      <div className="pb-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        <div className="space-y-0">
          {groups.map((group) => (
            <BudgetMonthSection
              key={group.key}
              anchorDate={group.date}
              budgets={group.budgets}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onSelectGroup={onSelectMany}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAskCoach={handleAskCoach}
              isPending={isRowPending}
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
        <div className="sticky top-0 z-20 bg-accent/50 border-y border-border px-4 py-3 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-3 px-6 py-2.5">
            <Skeleton className="size-4 rounded-sm shrink-0" />
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
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
