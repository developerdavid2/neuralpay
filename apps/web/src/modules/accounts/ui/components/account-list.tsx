"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { useAccountUrlSync } from "@/modules/accounts/hooks/use-account-url-sync";
import { useAccountsList } from "@/modules/accounts/hooks/queries/use-accounts";
import { useConfirm } from "@/hooks/use-confirm";
import { useDataTableNavigation } from "@/hooks/use-data-table-navigation";
import { ACCOUNTS_LIMIT } from "@/modules/accounts/constants";
import type { AccountStatus, AccountType, BankAccount } from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { accountColumns } from "./account-columns";
import { AccountFormDrawer } from "./account-form-drawer";
import { AccountViewDrawer } from "./account-view-drawer";
import { useAccountMutations } from "../../hooks/mutations/use-account-mutations";
import { useAccountDrawer } from "../../hooks/store/use-account-drawer";
import { useAccountPendingSelectors } from "../../hooks/store/use-account-pending";

interface Props {
  focusTransactionId?: string;
  focusMode?: string;
  currentSearch: string;
  currentTypes?: string[];
  currentStatuses?: string[];
  currentIsManual: boolean;
  currentLimit: number;
  currentPage: number;
  focusAccountId?: string;
}

export function AccountsList({
  currentSearch,
  currentTypes,
  currentStatuses,
  currentIsManual,
  currentLimit,
  currentPage,
  focusAccountId,
  focusMode,
}: Props) {
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [globalSelection, setGlobalSelection] = useState<Set<string>>(
    new Set(),
  );

  const { onOpenView, onOpenEdit } = useAccountDrawer();
  const { setUrl } = useAccountUrlSync();
  const { handleDelete: runDelete, handleBatchDelete } = useAccountMutations();
  const { isRowPending, isBatchDeleting } = useAccountPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();
  const { setPage } = useDataTableNavigation();

  const filters = useMemo(
    () => ({
      limit: Math.min(currentLimit || ACCOUNTS_LIMIT, 50),
      page: currentPage,
      search: currentSearch.trim() || undefined,
      type: currentTypes?.length ? (currentTypes as AccountType[]) : undefined,
      status: currentStatuses?.length
        ? (currentStatuses as AccountStatus[])
        : undefined,
      isManual: currentIsManual || undefined,
    }),
    [
      currentSearch,
      currentTypes,
      currentStatuses,
      currentIsManual,
      currentLimit,
      currentPage,
    ],
  );

  const { bankAccounts, isLoading, totalCount, pageCount } =
    useAccountsList(filters);

  const deletableIds = useMemo(
    () =>
      Array.from(globalSelection).filter(
        (id) => bankAccounts.find((a) => a.id === id)?.isManual,
      ),
    [globalSelection, bankAccounts],
  );

  const handleBatchDeleteWithConfirm = async () => {
    const count = deletableIds.length;
    if (count === 0) return;

    const ok = await confirm({
      title: `Delete ${count} account${count > 1 ? "s" : ""}`,
      message: `Do you want to delete ${count} selected account${count > 1 ? "s" : ""}? This will also remove associated transactions. This action cannot be undone.`,
      variant: "destructive",
      confirmLabel: `Delete ${count}`,
    });
    if (!ok) return;

    await handleBatchDelete(deletableIds);
    setGlobalSelection(new Set());
  };

  const handleView = (account: BankAccount) => {
    onOpenView(account.id);
    setUrl("view", account.id);
  };

  const handleEdit = (account: BankAccount) => {
    onOpenEdit(account.id);
    setUrl("edit", account.id);
  };

  const handleDelete = async (account: BankAccount) => {
    const ok = await confirm({
      title: "Delete account",
      message:
        "Are you sure you want to delete this account? This will also remove all associated transactions. This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await runDelete(account.id);
  };

  useEffect(() => {
    if (!focusAccountId || bankAccounts.length === 0) return;
    const target = bankAccounts.find((a) => a.id === focusAccountId);
    if (!target) return;

    if (focusMode === "edit") {
      onOpenEdit(focusAccountId);
    } else {
      onOpenView(focusAccountId);
    }
  }, [focusAccountId, focusMode, bankAccounts, onOpenView, onOpenEdit]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <Package className="size-8 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">No accounts found</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        You haven't added any accounts yet. Add your first account to get
        started.
      </p>
    </div>
  );

  if (isLoading) {
    return <AccountsListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full px-10">
      <ConfirmDialog />
      <DataTableToolbar
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnNames={["name", "type", "accountNumber", "balance", "status"]}
        selectedCount={globalSelection.size}
        deletableCount={deletableIds.length}
        onClearSelection={() => setGlobalSelection(new Set())}
        onBatchDelete={handleBatchDeleteWithConfirm}
        isBatchDeleting={isBatchDeleting}
        showLimitSelector
        currentLimit={currentLimit}
        limitOptions={["2", "10", "20", "30", "50"]}
        className="py-2 border-b"
      />

      <DataTable
        columns={accountColumns({
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
          isRowPending,
        })}
        data={bankAccounts}
        pagination="paged"
        pageSize={currentLimit}
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={setPage}
        rowIdKey="id"
        emptyState={emptyState}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        headerClassName="sticky top-0 z-20 backdrop-blur-xl bg-muted drop-shadow-lg dark:bg-secondary"
        getRowClassName={(row: BankAccount) =>
          isRowPending(row.id) ? "pointer-events-none opacity-50" : ""
        }
      />

      <DataTablePagination
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={currentLimit}
        totalRows={totalCount}
        showPageSelect={true}
      />

      <AccountViewDrawer />
      <AccountFormDrawer />
    </div>
  );
}

export function AccountsListSkeleton() {
  return (
    <div className="space-y-6 px-6 py-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 hidden sm:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
