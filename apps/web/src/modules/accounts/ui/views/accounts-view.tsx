import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { AccountFilters } from "../components/account-filters";
import { AccountsList, AccountsListSkeleton } from "../components/account-list";
import {
  AccountTypeCardsSkeleton,
  AccountTypeCardsView,
} from "./account-type-cards-view";
import { AccountDrawerInit } from "../components/account-drawer-init";

interface AccountsViewProps {
  search?: string;
  types?: string[];
  tags?: string[];
  statuses?: string[];
  isManual?: boolean;
  focusMode?: string;
  focusAccountId?: string;
  limit?: number;
  currentPage?: number;
}

export function AccountsView({
  search = "",
  types = [],
  tags = [],
  statuses = [],
  isManual = false,
  focusMode = "view",
  focusAccountId,
  limit = 20,
  currentPage = 1,
}: AccountsViewProps) {
  return (
    <div className="flex flex-col w-full gap-6 p-10 h-full">
      <DashboardHeader
        title="Accounts"
        description=" Manage your bank accounts and financial institutions"
      />

      <div>
        <SectionBoundary
          fallback={<AccountTypeCardsSkeleton />}
          errorMessage="Could not load accounts types"
        >
          <AccountTypeCardsView />
        </SectionBoundary>
        <AccountDrawerInit focusId={focusAccountId} mode={focusMode} />
        <div className="flex flex-col bg-card border border-muted shadow rounded-2xl flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0 px-10 py-4 border-b border-border">
            <AccountFilters />
          </div>
          <SectionBoundary
            key={`${search}-${types.join(",")}-${statuses.join(",")}-${isManual}-${limit}-${currentPage}`}
            fallback={<AccountsListSkeleton />}
            errorMessage="Could not load accounts lists"
          >
            <AccountsList
              currentSearch={search}
              currentTypes={types}
              currentStatuses={statuses}
              currentIsManual={isManual}
              currentLimit={limit}
              currentPage={currentPage}
            />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
}
