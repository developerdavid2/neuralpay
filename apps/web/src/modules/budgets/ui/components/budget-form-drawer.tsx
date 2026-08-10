"use client";

import type { CreateBudgetInput, UpdateBudgetInput } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
} from "@neuralpay/ui/components/sheet";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { endOfMonth, startOfMonth } from "date-fns";
import { X } from "lucide-react";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import {
  type BudgetDrawerMode,
  useBudgetDrawer,
} from "../../hooks/store/use-budget-drawer";
import { useBudgetPendingSelectors } from "../../hooks/store/use-budget-pending";
import { useBudgetUrlSync } from "../../hooks/use-budget-url-sync";
import type { FormValues } from "../../types";
import { BudgetForm } from "./budget-form";

export function BudgetFormDrawer() {
  const { isOpen, onClose, budgetId, mode } = useBudgetDrawer();
  const { clearUrl } = useBudgetUrlSync();

  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  if (!isOpen || (!isEdit && !isAdd)) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearUrl();
          onClose();
        }
      }}
    >
      <SheetContent className="data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-xl flex flex-col max-w-140!">
        <BudgetFormInner
          budgetId={budgetId}
          mode={mode}
          onClose={onClose}
          clearUrl={clearUrl}
        />
      </SheetContent>
    </Sheet>
  );
}

function BudgetFormInner({
  budgetId,
  mode,
  onClose,
  clearUrl,
}: {
  budgetId: string | null;
  mode: BudgetDrawerMode;
  onClose: () => void;
  clearUrl: () => void;
}) {
  const isEdit = mode === "edit";
  const { budget } = useBudgetDetail(isEdit && budgetId ? budgetId : "");
  const { isLoadingAccounts } = useAllAccounts();
  const {
    handleCreate,
    handleUpdate,
    handleDelete: runDelete,
    isCreating,
    isUpdating,
  } = useBudgetMutations();
  const { isDeleting } = useBudgetPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();
  const deleting = budgetId !== null ? isDeleting(budgetId) : false;
  const isSaving = isCreating || isUpdating;
  const isLoading = isLoadingAccounts || (isEdit && !budget);

  if (isLoading) {
    return (
      <>
        <ConfirmDialog />
        <FormDrawerSkeleton
          onClose={() => {
            clearUrl();
            onClose();
          }}
        />
      </>
    );
  }

  const now = new Date();

  const defaultValues: FormValues =
    isEdit && budget
      ? {
          name: budget.name,
          description: budget.description,
          categories: budget.categories.map((c) => ({
            category: c.category,
            limitAmount: Number(c.limitAmount),
          })),
          limitAmount: budget.categories.reduce(
            (sum, c) => sum + Number(c.limitAmount),
            0,
          ),
          color: budget.color ?? "#6366f1",
          period: budget.period ?? "custom",
          startDate: (budget.startDate
            ? new Date(budget.startDate)
            : startOfMonth(now)
          ).toISOString(),
          endDate: (budget.endDate
            ? new Date(budget.endDate)
            : endOfMonth(now)
          ).toISOString(),
          alertThreshold: budget.alertThreshold ?? 80,
          accountIds: budget.accounts.map((a) => a.bankAccountId),
        }
      : {
          name: "",
          description: undefined,
          categories: [{ category: "groceries", limitAmount: 0 }],
          limitAmount: 0,
          color: "#6366f1",
          period: "monthly",
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
          alertThreshold: 80,
          accountIds: [],
        };

  const onSubmit = async (values: FormValues) => {
    if (isEdit && budgetId) {
      await handleUpdate({
        id: budgetId,
        ...values,
      } as UpdateBudgetInput);
    } else {
      const ok = await confirm({
        title: "Create budget",
        message:
          "Are you sure you want to create this budget? It will be added to your records.",
        confirmLabel: "Create",
      });
      if (!ok) return;
      await handleCreate(values as CreateBudgetInput);
    }
    clearUrl();
    onClose();
  };

  const onDelete = async () => {
    if (!budgetId) return;
    const ok = await confirm({
      title: "Delete budget",
      message:
        "Are you sure you want to delete this budget? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await runDelete(budgetId);
    clearUrl();
    onClose();
  };

  return (
    <>
      <ConfirmDialog />
      <BudgetForm
        key={budget?.id ?? "add"}
        defaultValues={defaultValues}
        isEdit={isEdit}
        isSaving={isSaving}
        isDeleting={deleting}
        onSubmit={onSubmit}
        onDelete={isEdit ? onDelete : undefined}
        onClose={onClose}
        clearUrl={clearUrl}
      />
    </>
  );
}

function FormDrawerSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-6 py-4 border-b space-y-3 shrink-0">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t space-y-3 shrink-0">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <SheetClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-4 size-8 opacity-0"
          onClick={onClose}
          tabIndex={-1}
        >
          <X className="size-4" />
        </Button>
      </SheetClose>
    </>
  );
}
