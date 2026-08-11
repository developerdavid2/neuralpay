"use client";

import type { Budget } from "@neuralpay/types";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import { format } from "date-fns";
import { useMemo } from "react";
import { BudgetCard } from "./budget-card";

interface Props {
  anchorDate: Date;
  budgets: Budget[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectGroup: (ids: string[], checked: boolean) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAskCoach?: (budget: Budget) => void;
  isPending: (id: string) => boolean;
}

export function BudgetMonthSection({
  anchorDate,
  budgets,
  selectedIds,
  onSelect,
  onSelectGroup,
  onView,
  onEdit,
  onDelete,
  onAskCoach,
  isPending,
}: Props) {
  const groupIds = useMemo(() => budgets.map((b) => b.id), [budgets]);
  const selectedInGroup = groupIds.filter((id) => selectedIds.has(id));
  const allSelected =
    groupIds.length > 0 && selectedInGroup.length === groupIds.length;
  const someSelected = selectedInGroup.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) =>
    onSelectGroup(groupIds, checked);

  return (
    <div className="relative">
      <div className="sticky top-0 z-40 bg-accent/50 border-y border-border px-4 py-3 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-3 px-6 py-2.5">
          <div className="shrink-0">
            <Checkbox
              checked={allSelected}
              data-state={
                someSelected
                  ? "indeterminate"
                  : allSelected
                    ? "checked"
                    : "unchecked"
              }
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
            />
          </div>

          <span className="text-sm font-semibold text-foreground">
            {format(anchorDate, "MMMM yyyy")}
          </span>

          <span className="text-xs text-muted-foreground ml-auto tabular-nums">
            {budgets.length} budget{budgets.length === 1 ? "" : "s"}
            {selectedInGroup.length > 0 && (
              <span className="text-foreground font-medium">
                {" "}
                ({selectedInGroup.length} selected)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-col pb-2">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            selected={selectedIds.has(budget.id)}
            onSelect={onSelect}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onAskCoach={onAskCoach}
            isPending={isPending(budget.id)}
          />
        ))}
      </div>
    </div>
  );
}
