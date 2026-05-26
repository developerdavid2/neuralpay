"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  validateTransactionStatuses,
  validateTransactionTypes,
} from "../../lib/validate-transaction-enums";
import { TransactionFilters } from "../components/transaction-filters";
import {
  TransactionsList,
  TransactionsListSkeleton,
} from "../components/transaction-list";
import { PremiumButton } from "@/components/premium-button";
import { PlusIcon } from "lucide-react";

interface TransactionsViewProps {
  search: string;
  type: string;
  statuses: string[];
  accountType: string;
  accountId: string;
  dateFrom: string;
  dateTo: string;
  categories: string[];
  isManual: boolean;
  isAnomaly: boolean;
  amountMin: string;
  amountMax: string;
  focusTransactionId?: string;
  limit: number;
}

export function TransactionsView({
  search,
  type,
  statuses,
  accountType,
  accountId,
  dateFrom,
  dateTo,
  categories,
  isManual,
  isAnomaly,
  amountMin,
  amountMax,
  focusTransactionId,
  limit,
}: TransactionsViewProps) {
  const validatedType = validateTransactionTypes(type);
  const validatedStatuses = validateTransactionStatuses(statuses);

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Page header — outside scroll, does not stick */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <DashboardHeader
          title="Transactions"
          description="Track, filter, and manage all your financial activity"
          action={
            <PremiumButton icon={PlusIcon} className="w-fit">
              Add Me
            </PremiumButton>
          }
        />
      </div>

      {/*
        THE ONE AND ONLY scroll container.
        overflow-y-auto here means sticky children work correctly —
        they stick relative to THIS element, not the page.
        min-h-0 is required so flex-1 actually constrains height in a flex column.
      */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {/*
          LAYER 1 — Filter bar.
          sticky top-0 inside the overflow-y-auto container above.
          This sticks at the top of the scroll area.
        */}
        <div className="sticky top-0 z-20 bg-background border-b border-border px-6 py-3">
          <TransactionFilters
            currentSearch={search}
            currentType={type}
            currentStatuses={statuses}
            currentAccountType={accountType}
            currentAccountId={accountId}
            currentDateFrom={dateFrom}
            currentDateTo={dateTo}
            currentCategories={categories}
            currentIsManual={isManual}
            currentIsAnomaly={isAnomaly}
            currentAmountMin={amountMin}
            currentAmountMax={amountMax}
          />
        </div>

        {/*
          TransactionsList renders:
            LAYER 2 — Row B controls (sticky top-[57px])
            LAYER 3 — Column headers thead (sticky top-[98px])
            LAYER 4 — Month sub-headers per tbody (sticky top-[131px])
            LAYER 5 — Scrollable rows
        */}
        <SectionBoundary
          key={`${type}-${statuses.join(",")}-${search}-${accountType}-${accountId}-${dateFrom}-${dateTo}-${categories.join(",")}-${isManual}-${isAnomaly}-${amountMin}-${amountMax}-${limit}`}
          fallback={<TransactionsListSkeleton />}
          errorMessage="Could not load transactions"
        >
          <TransactionsList
            focusTransactionId={focusTransactionId}
            currentSearch={search}
            currentType={validatedType}
            currentStatuses={validatedStatuses}
            currentAccountType={accountType}
            currentAccountId={accountId}
            currentDateFrom={dateFrom}
            currentDateTo={dateTo}
            currentCategories={categories}
            currentIsManual={isManual}
            currentIsAnomaly={isAnomaly}
            currentAmountMin={amountMin}
            currentAmountMax={amountMax}
            currentLimit={limit}
          />
        </SectionBoundary>
      </div>
    </div>
  );
}
