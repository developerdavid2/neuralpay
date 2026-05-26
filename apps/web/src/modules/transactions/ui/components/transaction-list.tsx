"use client";
import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import type { TransactionStatus, TransactionType } from "@neuralpay/types";
import { useTransactionFilters } from "@/hooks/transactions/use-transaction-filters";
import { useTransactionMutations } from "@/hooks/transactions/use-transaction-mutations";
import { useTransactionsList } from "@/hooks/transactions/use-transactions";
import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { TransactionDrawer } from "./transaction-drawer";
import { TransactionMonthSection } from "./transaction-month-section";
import { TransactionToolbar } from "./transaction-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@neuralpay/ui/components/table";

interface Props {
  focusTransactionId?: string;
  currentSearch: string;
  currentTypes?: string[];
  currentStatuses?: string[];
  currentAccountType: string;
  currentAccountId: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentCategories: string[];
  currentIsManual: boolean;
  currentIsAnomaly: boolean;
  currentAmountMin: string;
  currentAmountMax: string;
  currentLimit: number;
}

export function TransactionsList({
  focusTransactionId,
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
  const {
    openView,
    openEdit,
    drawerOpen,
    drawerMode,
    selectedTransactionId,
    closeDrawer,
    handleBatchDelete,
  } = useTransactionMutations();

  const filters = useMemo(
    () => ({
      search: currentSearch || undefined,
      type: currentTypes?.length
        ? (currentTypes as TransactionType[])
        : undefined,
      status: currentStatuses?.length
        ? (currentStatuses as TransactionStatus[])
        : undefined,
      category: currentCategories?.length ? currentCategories : undefined,
      bankAccountId: currentAccountId || undefined,
      isManual: currentIsManual || undefined,
      isAnomaly: currentIsAnomaly || undefined,
      dateFrom: currentDateFrom || undefined,
      dateTo: currentDateTo || undefined,
      minAmount: currentAmountMin ? Number(currentAmountMin) : undefined,
      maxAmount: currentAmountMax ? Number(currentAmountMax) : undefined,
      limit: currentLimit || TRANSACTIONS_LIMIT,
    }),
    [
      currentSearch,
      currentTypes,
      currentStatuses,
      currentCategories,
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
  const { hasActiveFilters } = useTransactionFilters();

  const [globalSelection, setGlobalSelection] = useState<Set<string>>(
    new Set(),
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

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

      {/* Single table wrapping all month sections */}

      <div className="px-6 pb-6 overflow-y-auto scrollbar-hide flex-1 min-h-0">
        <Table noWrapper>
          {sortedMonths.map((monthKey) => (
            <TransactionMonthSection
              key={monthKey}
              monthKey={monthKey}
              transactions={grouped.get(monthKey)!}
              globalSelection={globalSelection}
              onSelectionChange={setGlobalSelection}
              onView={openView}
              onEdit={openEdit}
              columnVisibility={columnVisibility}
            />
          ))}
          <InfiniteScroll
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isLoading={isLoading}
            isManual={false}
          />
        </Table>
      </div>

      <TransactionDrawer
        transactionId={selectedTransactionId}
        mode={drawerMode}
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      />
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
