"use client";

import { Drawer, DrawerContent } from "@neuralpay/ui/components/drawer";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@neuralpay/types";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { endOfMonth, startOfMonth } from "date-fns";
import { useBudgetMutations } from "../../hooks/mutations/use-budget-mutations";
import { useBudgetDetail } from "../../hooks/queries/use-budget-detail";
import {
  useBudgetDrawer,
  type BudgetDrawerMode,
} from "../../hooks/store/use-budget-drawer";
import type { BudgetFormValues } from "../../types";
import { BudgetForm } from "./budget-form";

export function BudgetFormDrawer() {
  const { isOpen, onClose, budgetId, mode } = useBudgetDrawer();
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  if (!isOpen || (!isEdit && !isAdd)) return null;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=right]:inset-y-0",
          "data-[vaul-drawer-direction=right]:right-0",
          "data-[vaul-drawer-direction=right]:h-full",
          "data-[vaul-drawer-direction=right]:w-full",
          "data-[vaul-drawer-direction=right]:max-w-105",
          "flex flex-col",
          "focus-visible:outline-none focus-visible:ring-0",
        )}
      >
        <BudgetFormInner budgetId={budgetId} mode={mode} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
}

function BudgetFormInner({
  budgetId,
  mode,
  onClose,
}: {
  budgetId: string | null;
  mode: BudgetDrawerMode;
  onClose: () => void;
}) {
  const isEdit = mode === "edit";
  const { budget, isLoading } = useBudgetDetail(
    isEdit && budgetId ? budgetId : "",
  );
  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useBudgetMutations();
  const [ConfirmDialog, confirm] = useConfirm();

  if (isEdit && isLoading) return <FormDrawerSkeleton />;
  if (isEdit && !budget) return <FormDrawerSkeleton />;

  const now = new Date();
  const defaultValues: BudgetFormValues =
    isEdit && budget
      ? {
          name: budget.name ?? "",
          description: budget.description ?? undefined,
          category: budget.category,
          limitAmount: Number(budget.limitAmount ?? 0),
          color: budget.color ?? undefined,
          period: "custom",
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
          category: "groceries",
          limitAmount: 0,
          color: "#6366f1",
          period: "monthly",
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
          alertThreshold: 80,
          accountIds: [],
        };

  const onSubmit = async (values: BudgetFormValues) => {
    if (isEdit && budgetId) {
      await handleUpdate({
        id: budgetId,
        name: values.name,
        description: values.description ?? null,
        category: values.category,
        limitAmount: values.limitAmount,
        color: values.color ?? null,
        startDate: values.startDate,
        endDate: values.endDate,
        alertThreshold: values.alertThreshold,
        accountIds: values.accountIds,
      } as UpdateBudgetInput);
    } else {
      await handleCreate({
        name: values.name,
        description: values.description,
        category: values.category,
        limitAmount: values.limitAmount,
        color: values.color,
        period: values.period,
        startDate: values.startDate,
        endDate: values.endDate,
        alertThreshold: values.alertThreshold,
        accountIds: values.accountIds,
      } as CreateBudgetInput);
    }
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
    await handleDelete(budgetId);
    onClose();
  };

  return (
    <>
      <ConfirmDialog />
      <BudgetForm
        key={budget?.id ?? "add"}
        defaultValues={defaultValues}
        isEdit={isEdit}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
        onSubmit={onSubmit}
        onDelete={isEdit ? onDelete : undefined}
        onClose={onClose}
      />
    </>
  );
}

function FormDrawerSkeleton() {
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
    </>
  );
}
