"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@neuralpay/types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@neuralpay/ui/components/drawer";
import { Button } from "@neuralpay/ui/components/button";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Loader2, Trash2, X } from "lucide-react";

import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionDetail } from "@/hooks/transactions/use-transactions";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useConfirm } from "@/hooks/use-confirm";
import { useAccountsList } from "@/hooks/accounts/use-accounts";
import { TransactionFormFields } from "./transaction-form-fields";
import type { FormValues } from "../../types";

export function TransactionFormDrawer() {
  const { isOpen, onClose, transactionId, mode } = useTransactionDrawer();
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const { transaction, isLoading: isLoadingDetail } = useTransactionDetail(
    isEdit && transactionId ? transactionId : "",
  );
  const { bankAccounts, isLoading: isLoadingAccounts } = useAccountsList({
    limit: 20,
  });
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

  const isLoading = isLoadingDetail || isLoadingAccounts;
  const isPending = isCreating || isUpdating || isDeleting;

  const bankAccountOptions = (bankAccounts ?? []).map((acc) => ({
    label: `${acc.bankName ?? "Unknown"} • ${acc.name}`,
    value: acc.id,
  }));

  const schema = isEdit
    ? updateTransactionSchema.omit({ id: true })
    : createTransactionSchema.omit({ isManual: true });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankAccountId: "",
      description: "",
      amount: 0,
      type: "debit",
      status: "successful",
      merchant: "",
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    if (isEdit && transaction) {
      form.reset({
        bankAccountId: transaction.bankAccountId,
        description: transaction.description,
        amount: Math.abs(parseFloat(transaction.amount)),
        type: transaction.type,
        status: transaction.status ?? "successful",
        category: transaction.category ?? undefined,
        merchant: transaction.merchant ?? undefined,
        date: new Date(transaction.date),
        notes: transaction.notes ?? undefined,
      });
    } else if (isAdd && isOpen) {
      form.reset({
        bankAccountId: "",
        description: "",
        amount: 0,
        type: "debit",
        status: "successful",
        merchant: "",
        date: new Date(),
        notes: "",
      });
    }
  }, [transaction, isEdit, isAdd, isOpen, form]);

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
    onClose();
  };

  const onDelete = async () => {
    if (!transactionId) return;
    const ok = await confirm();
    if (!ok) return;
    runDelete(transactionId);
    onClose();
  };

  if (!isOpen || (!isEdit && !isAdd)) return null;

  return (
    <>
      <ConfirmDialog />

      <Drawer
        direction="right"
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <DrawerContent
          className="
    data-[vaul-drawer-direction=right]:inset-y-0 
    data-[vaul-drawer-direction=right]:right-0 
    data-[vaul-drawer-direction=right]:h-full 
    data-[vaul-drawer-direction=right]:w-full 
    data-[vaul-drawer-direction=right]:max-w-[420px]
    flex flex-col
    focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
  "
        >
          {isEdit && isLoading ? (
            <FormDrawerSkeleton />
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header: title + delete icon (edit only) + close */}
              <DrawerHeader className="px-6 py-4 border-b space-y-1 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle className="text-lg">
                      {isEdit ? "Edit Transaction" : "New Transaction"}
                    </DrawerTitle>
                    <DrawerDescription>
                      {isEdit
                        ? "Update your transaction details"
                        : "Add a manual transaction"}
                    </DrawerDescription>
                  </div>

                  <div className="flex items-center gap-1 -mr-2 -mt-2">
                    {/* Delete icon — only in edit mode */}
                    {isEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={onDelete}
                        disabled={isPending}
                        title="Delete transaction"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}

                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={onClose}
                        disabled={isPending || form.formState.isSubmitting}
                      >
                        <X className="size-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerHeader>

              {/* Scrollable fields */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
                <TransactionFormFields
                  form={form}
                  disabled={isPending}
                  bankAccountOptions={bankAccountOptions}
                />
              </div>

              {/* Footer: 2 buttons only */}
              <DrawerFooter className="px-6 py-4 border-t shrink-0">
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                  className="w-full"
                >
                  {isPending || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      {isEdit ? "Saving..." : "Creating..."}
                    </>
                  ) : isEdit ? (
                    "Save Changes"
                  ) : (
                    "Create Transaction"
                  )}
                </Button>

                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isPending || form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

// Skeleton mimicking header + fields + footer structure
function FormDrawerSkeleton() {
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

      {/* Body skeleton — mimics form fields */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Bank Account combobox */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Amount + Type row */}
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
