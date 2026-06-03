import { DashboardHeader } from "@/components/dashboard-header";
import { NewAccountButton } from "../components/new-account-button";
import {
  AccountTypeCardsSkeleton,
  AccountTypeCardsView,
} from "./account-type-cards-view";
import { SectionBoundary } from "@/components/section-boundary";
import { AccountsList, AccountsListSkeleton } from "../components/account-list";
import { AccountFilters } from "../components/account-filters";

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
        action={<NewAccountButton />}
      />

      {/*TODO:  FIlters */}
      <div>
        <SectionBoundary
          fallback={<AccountTypeCardsSkeleton />}
          errorMessage="Could not load accounts types"
        >
          <AccountTypeCardsView />
        </SectionBoundary>
        <div className="flex flex-col bg-card border border-muted shadow rounded-2xl flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0 px-6 py-3 border-b border-border">
            <AccountFilters />
          </div>
          <SectionBoundary
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
              focusAccountId={focusAccountId}
              focusMode={focusMode}
            />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
}
