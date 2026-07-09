"use client";

import {
  type CreateAccountInput,
  type SupportedCurrencies,
  type UpdateAccountInput,
} from "@neuralpay/types";
import { Drawer, DrawerContent } from "@neuralpay/ui/components/drawer";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { cn } from "@neuralpay/ui/lib/utils";
import { useAccountUrlSync } from "@/modules/accounts/hooks/use-account-url-sync";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useAccountMutations } from "../../hooks/mutations/use-account-mutations";
import { useAccountDetail } from "../../hooks/queries/use-account-detail";
import {
  useAccountDrawer,
  type AccountDrawerMode,
} from "../../hooks/store/use-account-drawer";
import type { FormValues } from "../../types";
import { AccountForm } from "./account-form";
import { useAccountPendingSelectors } from "../../hooks/store/use-account-pending";

export function AccountFormDrawer() {
  const { isOpen, onClose, accountId, mode } = useAccountDrawer();
  const { clearUrl } = useAccountUrlSync();
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

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
          "data-[vaul-drawer-direction=right]:max-w-105",
          "flex flex-col",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        )}
      >
        <AccountFormInner
          accountId={accountId}
          mode={mode}
          onClose={onClose}
          clearUrl={clearUrl}
        />
      </DrawerContent>
    </Drawer>
  );
}

function AccountFormInner({
  accountId,
  mode,
  onClose,
  clearUrl,
}: {
  accountId: string | null;
  mode: AccountDrawerMode;
  onClose: () => void;
  clearUrl: () => void;
}) {
  const isEdit = mode === "edit";

  const { account, isLoading: isLoadingDetail } = useAccountDetail(
    isEdit && accountId ? accountId : "",
  );
  const {
    handleCreate,
    handleUpdate,
    handleDelete: runDelete,
    isCreating,
    isUpdating,
  } = useAccountMutations();
  const { isDeleting } = useAccountPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();

  const isLoading = isEdit && isLoadingDetail;
  const deleting = accountId !== null ? isDeleting(accountId) : false;
  const isSaving = isCreating || isUpdating;

  if (isLoading) return <FormDrawerSkeleton />;
  if (isEdit && !account) return <FormDrawerSkeleton />;

  const defaultValues: FormValues =
    isEdit && account
      ? {
          name: account.name,
          type: account.type,
          bankName: account.bankName ?? undefined,
          maskedNumber: account.maskedNumber ?? undefined,
          currency: account.currency as SupportedCurrencies,
          balance: account.balance ? Number(account.balance) : 0,
        }
      : {
          name: "",
          type: "checking",
          bankName: "",
          maskedNumber: "",
          currency: "USD",
          balance: 0,
        };

  const onSubmit = async (values: FormValues) => {
    if (isEdit && accountId) {
      await handleUpdate({
        id: accountId,
        ...values,
      } as UpdateAccountInput);
    } else {
      const ok = await confirm({
        title: "Create account",
        message:
          "Are you sure you want to create this account? It will be added to your records.",
        confirmLabel: "Create",
      });
      if (!ok) return;

      await handleCreate({
        ...values,
        isManual: true,
      } as CreateAccountInput);
    }
    clearUrl();
    onClose();
  };

  const onDelete = async () => {
    if (!accountId) return;
    const ok = await confirm({
      title: "Delete account",
      message:
        "Are you sure you want to delete this account? This will also remove all associated transactions. This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await runDelete(accountId);
    clearUrl();
    onClose();
  };

  return (
    <>
      <ConfirmDialog />
      <AccountForm
        key={account?.id ?? "add"}
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

function FormDrawerSkeleton() {
  return (
    <>
      <div className="px-6 py-4 border-b space-y-3 shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
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
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>

      <div className="px-6 py-4 border-t space-y-3 shrink-0">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </>
  );
}
