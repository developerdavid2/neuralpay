import { DashboardHeader } from "@/components/dashboard-header";
import { NewAccountButton } from "../components/new-account-button";
import {
  AccountTypeCardsSkeleton,
  AccountTypeCardsView,
} from "./account-type-cards-view";
import { SectionBoundary } from "@/components/section-boundary";

interface AccountsViewProps {
  search?: string;
  types?: string[];
  tags?: string[];
  statuses?: string[];
  isManual?: boolean;
  focusMode?: string;
  focusAccountId?: string;
  limit?: number;
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
}: AccountsViewProps) {
  return (
    <div className="flex flex-col w-full gap-6 p-6 h-full">
      <DashboardHeader
        title="Accounts"
        description=" Manage your bank accounts and financial institutions"
        action={<NewAccountButton />}
      />

      <div>
        <SectionBoundary
          fallback={<AccountTypeCardsSkeleton />}
          errorMessage="Could not load accounts"
        >
          <AccountTypeCardsView />
        </SectionBoundary>
      </div>
    </div>
  );
}
