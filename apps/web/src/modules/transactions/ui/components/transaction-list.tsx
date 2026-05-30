"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useTransactionDrawer } from "@/hooks/transactions/use-transaction-drawer";
import { useTransactionFilters } from "@/hooks/transactions/use-transaction-filters";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useTransactionUrlSync } from "@/hooks/transactions/use-transaction-url-sync";
import { useTransactionsList } from "@/hooks/transactions/use-transactions";
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
import { TransactionToolbar } from "./transaction-toolbar";
import { TransactionViewDrawer } from "./transaction-view-drawer";

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

  const handleView = (tx: Transaction) => {
    onOpenView(tx.id);
    syncToUrl("view", tx.id);
  };

  const handleEdit = (tx: Transaction) => {
    onOpenEdit(tx.id);
    syncToUrl("edit", tx.id);
  };

  const handleDelete = async (tx: Transaction) => {
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
    if (!focusTransactionId || allTransactions.length === 0) return;

    const target = allTransactions.find((t) => t.id === focusTransactionId);
    if (!target) return;

    const { isOpen, transactionId } = useTransactionDrawer.getState();
    if (isOpen && transactionId === focusTransactionId) return;

    if (focusMode === "edit") {
      onOpenEdit(focusTransactionId);
    } else {
      onOpenView(focusTransactionId);
    }
  }, [focusTransactionId, focusMode, allTransactions, onOpenView, onOpenEdit]);

  const deletableIds = Array.from(globalSelection).filter(
    (id) => allTransactions.find((t) => t.id === id)?.isManual,
  );

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
    <div className="flex flex-col h-full">
      <TransactionToolbar
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        selectedCount={globalSelection.size}
        deletableCount={deletableIds.length}
        onClearSelection={() => setGlobalSelection(new Set())}
        onBatchDelete={() =>
          handleBatchDelete(deletableIds).then(() =>
            setGlobalSelection(new Set()),
          )
        }
      />

      <div className="px-6 pb-6 overflow-y-auto scrollbar-hide flex-1 min-h-0">
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
    <div className="flex flex-col gap-4 px-6 py-4">
      {Array.from({ length: 3 }).map((_, monthIdx) => (
        <div
          key={monthIdx}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: 4 }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="size-7 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-16 hidden sm:block" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="size-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
