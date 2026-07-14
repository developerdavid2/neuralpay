import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { ConnectedBanksSkeleton } from "../components/connected-banks-skeleton";
import { ConnectedBanksContent } from "../components/connected-banks-content";
import { ConnectBankAccountButton } from "../components/connect-bank-button";
import { PlaidController } from "../components/plaid-controller";
import { Shield } from "lucide-react";
import { ProviderSelectModal } from "../components/provider-select-modal";

export function ConnectedBanksView() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="Connected Banks"
        description="Manage your bank connections and automatically import transactions"
        action={<ConnectBankAccountButton />}
      />

      <PlaidController />
      {/* Trust Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Bank-grade security</p>
          <p className="text-xs text-muted-foreground">
            Your credentials are never stored. We use read-only access via
            OAuth.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          256-bit encryption
        </div>
      </div>

      <SectionBoundary
        fallback={<ConnectedBanksSkeleton />}
        errorMessage="Could not load connected banks"
      >
        <ConnectedBanksContent />
      </SectionBoundary>
      <ProviderSelectModal />
    </div>
  );
}
