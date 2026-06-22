import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  validateTransactionCategories,
  validateTransactionStatuses,
  validateTransactionTypes,
} from "../../lib/validate-transaction-enums";
import { NewTransactionButton } from "../components/new-transaction-button";
import { TransactionFilters } from "../components/transaction-filters";
import {
  TransactionsList,
  TransactionsListSkeleton,
} from "../components/transaction-list";
import { SearchableCombobox } from "@/components/searchable-combobox";

interface TransactionsViewProps {
  search?: string;
  types?: string[];
  statuses?: string[];
  accountType?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  isManual?: boolean;
  isAnomaly?: boolean;
  amountMin?: string;
  amountMax?: string;
  focusTransactionId?: string;
  focusMode?: string;
  limit?: number;
}

export function TransactionsView({
  search = "",
  types = [],
  statuses = [],
  accountType = "all",
  accountId = "",
  dateFrom = "",
  dateTo = "",
  categories = [],
  isManual = false,
  isAnomaly = false,
  amountMin = "",
  amountMax = "",
  limit = 20,
  focusMode = "view",
  focusTransactionId,
}: TransactionsViewProps) {
  const validatedTypes = validateTransactionTypes(types);
  const validatedStatuses = validateTransactionStatuses(statuses);
  const validatedCategories = validateTransactionCategories(categories);

  return (
    <div className="flex flex-col w-full gap-6 p-10 h-[105vh]">
      <DashboardHeader
        title="Transactions"
        description="Track, filter, and manage all your financial activity"
        action={<NewTransactionButton />}
      />

      <div className="flex flex-col bg-card border border-muted shadow rounded-2xl flex-1 min-h-0 overflow-hidden">
        <div className="shrink-0 px-10 py-4 border-b border-border">
          <TransactionFilters />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 scrollbar-hide overflow-hidden">
          <SectionBoundary
            key={`${types.join(",")}-${statuses.join(",")}-${search}-${accountType}-${accountId}-${dateFrom}-${dateTo}-${categories.join(",")}-${isManual}-${isAnomaly}-${amountMin}-${amountMax}-${limit}`}
            fallback={<TransactionsListSkeleton />}
            errorMessage="Could not load transactions"
          >
            <TransactionsList
              currentSearch={search}
              currentTypes={validatedTypes}
              currentStatuses={validatedStatuses}
              currentAccountType={accountType}
              currentAccountId={accountId}
              currentDateFrom={dateFrom}
              currentDateTo={dateTo}
              currentCategories={validatedCategories}
              currentIsManual={isManual}
              currentIsAnomaly={isAnomaly}
              currentAmountMin={amountMin}
              currentAmountMax={amountMax}
              currentLimit={limit}
              focusTransactionId={focusTransactionId}
              focusMode={focusMode}
            />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
}
