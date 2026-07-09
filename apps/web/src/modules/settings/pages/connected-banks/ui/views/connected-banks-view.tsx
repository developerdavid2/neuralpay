import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { ConnectedBanksSkeleton } from "../components/connected-banks-skeleton";
import { ConnectedBanksContent } from "../components/connected-banks-content";
import { ConnectBankAccountButton } from "../components/connect-bank-button";

export function ConnectedBanksView() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="Connected Banks"
        description="Manage your bank connections and automatically import transactions"
        action={<ConnectBankAccountButton />}
      />

      <SectionBoundary
        fallback={<ConnectedBanksSkeleton />}
        errorMessage="Could not load connected banks"
      >
        <ConnectedBanksContent />
      </SectionBoundary>
    </div>
  );
}
