"use client";

import {
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@neuralpay/types";
import { Drawer, DrawerContent } from "@neuralpay/ui/components/drawer";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";

import { useAllAccounts } from "@/hooks/accounts/use-all-accounts";
import type { TransactionDrawerMode } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useTransactionUrlSync } from "@/hooks/transactions/use-transaction-url-sync";
import { useTransactionDetail } from "@/hooks/transactions/use-transactions";
import { useConfirm } from "@/hooks/use-confirm";
import type { FormValues } from "../../types";
import { TransactionForm } from "./transaction-form";

export function TransactionFormDrawer() {
  const { isOpen, onClose, transactionId, mode } = useTransactionDrawer();
  const { clearUrl } = useTransactionUrlSync();

  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  // Always render the drawer when open — content handles its own loading
  if (!isOpen || (!isEdit && !isAdd)) return null;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearUrl();
          onClose();
        }
      }}
    >
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=right]:inset-y-0",
          "data-[vaul-drawer-direction=right]:right-0",
          "data-[vaul-drawer-direction=right]:h-full",
          "data-[vaul-drawer-direction=right]:w-full",
          "data-[vaul-drawer-direction=right]:max-w-[420px]",
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
      </DrawerContent>
    </Drawer>
  );
}

// ── Inner: handles data fetching + renders skeleton immediately ───────────
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
  const { bankAccountOptions, isLoadingAccounts } = useAllAccounts();

  const {
    handleCreate,
    handleUpdate,
    handleDelete: runDelete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTransactionMutations();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete transaction",
    "Are you sure you want to delete this transaction? This action cannot be undone.",
    "destructive",
  );

  const isPending = isCreating || isUpdating || isDeleting;

  // Show skeleton immediately while ANY data is loading
  // This matches the insight drawer pattern exactly
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

  // Data is ready — render the form
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
    const ok = await confirm();
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
        isPending={isPending}
        bankAccountOptions={bankAccountOptions}
        onSubmit={onSubmit}
        onDelete={isEdit ? onDelete : undefined}
        onClose={onClose}
        clearUrl={clearUrl}
      />
    </>
  );
}

// ── Skeleton: mirrors the exact form layout for instant render ──────────────
function FormDrawerSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Header skeleton */}
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
