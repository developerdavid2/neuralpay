"use client";

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionFilters } from "@/hooks/transactions/use-transaction-filters";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useTransactionPendingSelectors } from "@/hooks/transactions/use-transaction-pending";
import { useTransactionUrlSync } from "@/hooks/transactions/use-transaction-url-sync";
import { useTransactionsList } from "@/hooks/transactions/use-transactions";
import { useConfirm } from "@/hooks/use-confirm";
import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import type {
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@neuralpay/types";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { Table } from "@neuralpay/ui/components/table";
import { Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TransactionFormDrawer } from "./transaction-form-drawer";
import { TransactionMonthSection } from "./transaction-month-section";
import { TransactionViewDrawer } from "./transaction-view-drawer";
import { useQueryParam } from "@/hooks/use-query-param";

interface Props {
  focusTransactionId?: string;
  focusMode?: string;
  currentSearch: string;
  currentTypes?: string[];
  currentStatuses?: string[];
  currentAccountType: string;
  currentAccountId: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentCategories?: string[];
  currentIsManual: boolean;
  currentIsAnomaly: boolean;
  currentAmountMin: string;
  currentAmountMax: string;
  currentLimit: number;
}

export function TransactionsList({
  focusTransactionId,
  focusMode,
  currentSearch,
  currentTypes,
  currentStatuses,
  currentAccountType,
  currentAccountId,
  currentDateFrom,
  currentDateTo,
  currentCategories,
  currentIsManual,
  currentIsAnomaly,
  currentAmountMin,
  currentAmountMax,
  currentLimit,
}: Props) {
  const [globalSelection, setGlobalSelection] = useState<Set<string>>(
    new Set(),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const { hasActiveFilters } = useTransactionFilters();
  const { onOpenView, onOpenEdit } = useTransactionDrawer();
  const { syncToUrl } = useTransactionUrlSync();
  const { handleBatchDelete, handleDelete: runDelete } =
    useTransactionMutations();
  const { isRowPending, isBatchDeleting } = useTransactionPendingSelectors();
  const [ConfirmDialog, confirm] = useConfirm();
  const { currentValue: limitFromUrl } = useQueryParam("limit");
  const displayLimit = limitFromUrl ? Number(limitFromUrl) : currentLimit;

  const handleView = (tx: Transaction) => {
    onOpenView(tx.id, tx);
    syncToUrl("view", tx.id);
  };

  const handleEdit = (tx: Transaction) => {
    onOpenEdit(tx.id, tx);
    syncToUrl("edit", tx.id);
  };

  const handleDelete = async (tx: Transaction) => {
    const ok = await confirm({
      title: "Delete transaction",
      message:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await runDelete(tx.id);
  };

  const filters = useMemo(
    () => ({
      search: currentSearch || undefined,
      type: currentTypes?.length
        ? (currentTypes as TransactionType[])
        : undefined,
      status: currentStatuses?.length
        ? (currentStatuses as TransactionStatus[])
        : undefined,
      category: currentCategories?.length
        ? (currentCategories as TransactionCategory[])
        : undefined,
      accountType:
        currentAccountType && currentAccountType !== "all"
          ? currentAccountType
          : undefined,
      bankAccountId: currentAccountId || undefined,
      isManual: currentIsManual || undefined,
      isAnomaly: currentIsAnomaly || undefined,
      dateFrom: currentDateFrom || undefined,
      dateTo: currentDateTo || undefined,
      minAmount: currentAmountMin ? Number(currentAmountMin) : undefined,
      maxAmount: currentAmountMax ? Number(currentAmountMax) : undefined,
      limit: Math.min(currentLimit || TRANSACTIONS_LIMIT, 50),
    }),
    [
      currentSearch,
      currentTypes,
      currentStatuses,
      currentCategories,
      currentAccountType,
      currentAccountId,
      currentIsManual,
      currentIsAnomaly,
      currentDateFrom,
      currentDateTo,
      currentAmountMin,
      currentAmountMax,
      currentLimit,
    ],
  );

  const {
    allTransactions,
    grouped,
    sortedMonths,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useTransactionsList(filters);

  useEffect(() => {
    if (!focusTransactionId) return;

    const { isOpen, transactionId } = useTransactionDrawer.getState();
    if (isOpen && transactionId === focusTransactionId) return;

    if (focusMode === "edit") {
      onOpenEdit(focusTransactionId);
    } else {
      onOpenView(focusTransactionId);
    }
  }, [focusTransactionId, focusMode]);

  const deletableIds = useMemo(
    () =>
      Array.from(globalSelection).filter(
        (id) => allTransactions.find((t) => t.id === id)?.isManual,
      ),
    [globalSelection, allTransactions],
  );

  const handleBatchDeleteWithConfirm = async () => {
    const count = deletableIds.length;
    if (count === 0) return;

    const ok = await confirm({
      title: `Delete ${count} transaction${count > 1 ? "s" : ""}`,
      message: `Do you want to delete ${count} selected transaction${count > 1 ? "s" : ""}? This action cannot be undone.`,
      variant: "destructive",
      confirmLabel: `Delete ${count}`,
    });
    if (!ok) return;

    await handleBatchDelete(deletableIds);
    setGlobalSelection(new Set());
  };

  if (allTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <Package className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          No transactions match your filters
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          {hasActiveFilters
            ? "Some filter combinations may have no results. Try removing a filter to broaden your search."
            : "You have no transactions yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-6">
      <ConfirmDialog />
      <DataTableToolbar
        showLimitSelector
        limitOptions={["10", "20", "30", "50"]}
        columnNames={["merchant", "category", "amount", "status"]}
        className="m-6"
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        selectedCount={globalSelection.size}
        deletableCount={deletableIds.length}
        onClearSelection={() => setGlobalSelection(new Set())}
        onBatchDelete={handleBatchDeleteWithConfirm}
        isBatchDeleting={isBatchDeleting}
        currentLimit={displayLimit}
      />

      <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        <Table noWrapper>
          {sortedMonths.map((monthKey) => (
            <TransactionMonthSection
              key={monthKey}
              monthKey={monthKey}
              transactions={grouped.get(monthKey)!}
              globalSelection={globalSelection}
              onSelectionChange={setGlobalSelection}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isRowPending={isRowPending}
              columnVisibility={columnVisibility}
            />
          ))}
        </Table>
        <InfiniteScroll
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          isManual={false}
        />
      </div>

      <TransactionViewDrawer />
      <TransactionFormDrawer />
    </div>
  );
}

export function TransactionsListSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar skeleton */}
      <div className="sticky top-0 z-30 mx-6 py-2 flex items-center justify-between gap-4 border-t">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-[90px] rounded-md" />
          <Skeleton className="h-7 w-[90px] rounded-md" />
        </div>
      </div>

      <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide space-y-0">
        {/* Month section skeleton */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Month header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Column headers */}
          <div className="flex items-center px-4 py-2.5 border-b border-border bg-muted/20">
            <Skeleton className="size-4 rounded-sm mr-4" />
            <div className="flex items-center gap-1.5 w-[100px]">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-1.5 w-[140px]">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex items-center gap-1.5 w-[100px] justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex items-center gap-1.5 w-[100px] justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="size-3" />
            </div>
            <Skeleton className="size-4 ml-4" />
          </div>

          {/* Transaction rows */}
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center px-4 py-3 border-b border-border last:border-b-0"
            >
              {/* Checkbox */}
              <Skeleton className="size-4 rounded-sm mr-4 shrink-0" />

              {/* Date: "May 25" + "12:13" */}
              <div className="w-[100px] shrink-0 space-y-0.5">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>

              {/* Merchant: Icon + Name + Sublabel */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Category */}
              <div className="w-[140px] shrink-0">
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Amount (right-aligned) */}
              <div className="w-[100px] shrink-0 flex justify-end">
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Status badge */}
              <div className="w-[100px] shrink-0 flex justify-end">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              {/* Actions */}
              <Skeleton className="size-4 ml-4 shrink-0" />
            </div>
          ))}
        </div>

        {/* Second month section for variety */}
        <div className="rounded-xl border border-border bg-card overflow-hidden mt-4">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center px-4 py-2.5 border-b border-border bg-muted/20">
            <Skeleton className="size-4 rounded-sm mr-4" />
            <div className="flex items-center gap-1.5 w-[100px]">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-1.5 w-[140px]">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex items-center gap-1.5 w-[100px] justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="size-3" />
            </div>
            <div className="flex items-center gap-1.5 w-[100px] justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="size-3" />
            </div>
            <Skeleton className="size-4 ml-4" />
          </div>
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center px-4 py-3 border-b border-border last:border-b-0"
            >
              <Skeleton className="size-4 rounded-sm mr-4 shrink-0" />
              <div className="w-[100px] shrink-0 space-y-0.5">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="w-[140px] shrink-0">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="w-[100px] shrink-0 flex justify-end">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="w-[100px] shrink-0 flex justify-end">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="size-4 ml-4 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
