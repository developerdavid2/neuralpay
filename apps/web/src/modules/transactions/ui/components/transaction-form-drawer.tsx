"use client";

import {
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";

import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";

import { useConfirm } from "@/hooks/ui/use-confirm";
import { useTransactionMutations } from "@/modules/transactions/hooks/mutations/use-transaction-mutations";
import { useTransactionDetail } from "@/modules/transactions/hooks/queries/use-transaction-detail";
import { useTransactionUrlSync } from "@/modules/transactions/hooks/use-transaction-url-sync";
import { Sheet, SheetContent } from "@neuralpay/ui/components/sheet";
import {
  useTransactionDrawer,
  type TransactionDrawerMode,
} from "../../hooks/store/use-transaction-drawer";
import type { FormValues } from "../../types";
import { TransactionForm } from "./transaction-form";
import { useTransactionPendingSelectors } from "../../hooks/store/use-transaction-pending";

export function TransactionFormDrawer() {
  const { isOpen, onClose, transactionId, mode } = useTransactionDrawer();
  const { clearUrl } = useTransactionUrlSync();

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
      <SheetContent
        side="right"
        className={cn(
          "data-[vaul-drawer-direction=right]:inset-y-0",
          "data-[vaul-drawer-direction=right]:right-0",
          "data-[vaul-drawer-direction=right]:h-full",
          "data-[vaul-drawer-direction=right]:w-full",
          "data-[vaul-drawer-direction=right]:max-w-105",
          "flex flex-col",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        )}
      >
        <TransactionFormInner
          transactionId={transactionId}
          mode={mode}
          onClose={onClose}
          clearUrl={clearUrl}
        />
      </SheetContent>
    </Sheet>
  );
}

function TransactionFormInner({
  transactionId,
  mode,
  onClose,
  clearUrl,
}: {
  transactionId: string | null;
  mode: TransactionDrawerMode;
  onClose: () => void;
  clearUrl: () => void;
}) {
  const isEdit = mode === "edit";

  const { transaction } = useTransactionDetail(
    isEdit && transactionId ? transactionId : "",
  );
  const { isLoadingAccounts } = useAllAccounts();

  const {
    handleCreate,
    handleUpdate,
    handleDelete: runDelete,
    isCreating,
    isUpdating,
  } = useTransactionMutations();
  const { isDeleting } = useTransactionPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();
  const deleting = transactionId !== null ? isDeleting(transactionId) : false;
  const isSaving = isCreating || isUpdating;
  const isLoading = isLoadingAccounts || (isEdit && !transaction);

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

  const defaultValues: FormValues =
    isEdit && transaction
      ? {
          bankAccountId: transaction.bankAccountId,
          description: transaction.description,
          amount: Math.abs(parseFloat(transaction.amount)),
          type: transaction.type,
          status: transaction.status ?? "successful",
          category: transaction.category ?? undefined,
          merchant: transaction.merchant ?? undefined,
          date: new Date(transaction.date),
          notes: transaction.notes ?? undefined,
        }
      : {
          bankAccountId: "",
          description: "",
          amount: 0,
          type: "debit",
          status: "successful",
          merchant: "",
          date: new Date(),
          notes: "",
        };

  const onSubmit = async (values: FormValues) => {
    if (isEdit && transactionId) {
      await handleUpdate({
        id: transactionId,
        ...values,
      } as UpdateTransactionInput);
    } else {
      const ok = await confirm({
        title: "Create transaction",
        message:
          "Are you sure you want to create this transaction? It will be added to your records.",
        confirmLabel: "Create",
      });
      if (!ok) return;

      await handleCreate({
        ...values,
        isManual: true,
      } as CreateTransactionInput);
    }
    clearUrl();
    onClose();
  };

  const onDelete = async () => {
    if (!transactionId) return;
    const ok = await confirm({
      title: "Delete transaction",
      message:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await runDelete(transactionId);
    clearUrl();
    onClose();
  };

  return (
    <>
      <ConfirmDialog />
      <TransactionForm
        key={transaction?.id ?? "add"}
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
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Bank Account */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Amount + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        {/* Date */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Status */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Category */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Merchant */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Notes */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="px-6 py-4 border-t space-y-3 shrink-0">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </>
  );
}
