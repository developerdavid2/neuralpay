"use client";

import { Button } from "@neuralpay/ui/components/button";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetPendingSelectors } from "../../hooks/store/use-budget-pending";
import {
  useAllBudgetIds,
  useBudgetSelectionActions,
  useSelectedArray,
  useSelectedIds,
} from "../../hooks/store/use-budget-selection";

export function BudgetToolbar() {
  const selectedIds = useSelectedIds();
  const selectedArray = useSelectedArray();
  const allBudgetIds = useAllBudgetIds();
  const { onClearSelection, onSelectAll } = useBudgetSelectionActions();
  const { handleBatchDelete } = useBudgetMutations();
  const { isBatchDeleting } = useBudgetPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();

  const selectedCount = selectedIds.size;
  const totalCount = allBudgetIds.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleBatchDeleteWithConfirm = async () => {
    const count = selectedCount;
    if (count === 0) return;

    const ok = await confirm({
      title: `Delete ${count} budget${count > 1 ? "s" : ""}`,
      message: `Do you want to delete ${count} selected budget${count > 1 ? "s" : ""}? This does not affect your actual accounts and transactions. This action cannot be undone.`,
      variant: "destructive",
      confirmLabel: `Delete ${count}`,
    });
    if (!ok) return;

    await handleBatchDelete(selectedArray);
    onClearSelection();
  };

  if (selectedCount > 0) {
    return (
      <>
        <ConfirmDialog />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={isAllSelected}
              data-state={
                isPartialSelected
                  ? "indeterminate"
                  : isAllSelected
                    ? "checked"
                    : "unchecked"
              }
              onCheckedChange={() => {
                if (isAllSelected) onClearSelection();
                else onSelectAll(allBudgetIds);
              }}
              disabled={isBatchDeleting}
            />
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isBatchDeleting}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDeleteWithConfirm}
              disabled={isBatchDeleting}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              {isBatchDeleting ? "Deleting..." : `Delete ${selectedCount}`}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Checkbox
        checked={false}
        onCheckedChange={() => onSelectAll(allBudgetIds)}
        disabled={totalCount === 0}
      />
      <span className="text-sm text-muted-foreground">
        {totalCount > 0
          ? `${totalCount} budget${totalCount !== 1 ? "s" : ""}`
          : "No budgets"}
      </span>
    </div>
  );
}
