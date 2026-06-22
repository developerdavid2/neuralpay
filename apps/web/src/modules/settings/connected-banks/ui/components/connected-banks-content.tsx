"use client";

import { Landmark, Shield } from "lucide-react";

import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";
import { useGetConnectedBanks } from "../../hooks/queries/use-get-connected-bank";
import { ConnectedBanksSkeleton } from "./connected-banks-skeleton";

import { ConnectBankAccountButton } from "./connect-bank-button";
import { InstitutionCard } from "./institution-card";
import { PlaidController } from "./plaid-controller";
import { ProviderSelectModal } from "./provider-select-modal";

export function ConnectedBanksContent() {
  const { data: connectedBanks = [], isLoading: isLoadingBanks } =
    useGetConnectedBanks();
  const { accountsData } = useAllAccounts({ isManual: false });
  const linkedAccounts = accountsData?.filter((a) => a.plaidItemId) ?? [];
  const hasConnectedBanks = connectedBanks.length > 0;

  if (isLoadingBanks) {
    return <ConnectedBanksSkeleton />;
  }

  return (
    <>
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

      {/* No Connection State */}
      {!hasConnectedBanks && (
        <div className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16 gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Landmark className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center max-w-sm">
              <h3 className="text-lg font-semibold">No bank connected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your bank to automatically sync transactions, track
                spending, and get AI-powered insights.
              </p>
            </div>

            <ConnectBankAccountButton />
          </div>
        </div>
      )}
      {/* Connected State — one card per institution */}
      {hasConnectedBanks && (
        <div className="space-y-4">
          {connectedBanks.map((bank) => {
            const bankAccounts = linkedAccounts.filter(
              (a) => a.plaidItemId === bank.itemId,
            );
            return (
              <InstitutionCard
                key={bank.id}
                bank={bank}
                accounts={bankAccounts}
              />
            );
          })}
        </div>
      )}

      <ProviderSelectModal />
    </>
  );
}
