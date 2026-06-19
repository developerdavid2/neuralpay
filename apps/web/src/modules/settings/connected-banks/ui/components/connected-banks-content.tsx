"use client";

import { Badge } from "@neuralpay/ui/components/badge";
import { Button } from "@neuralpay/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@neuralpay/ui/components/card";
import { Separator } from "@neuralpay/ui/components/separator";
import { formatDistanceToNow } from "date-fns";
import { Landmark, Plus, Shield, Wallet } from "lucide-react";
import { useState } from "react";

import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";
import { useGetConnectedBank } from "../../hooks/queries/use-get-connected-bank";
import { ConnectedBanksSkeleton } from "./connected-banks-skeleton";
import { PlaidLinkButton } from "./plaid-link-button";

import { DisconnectButton } from "./disconnect-button";
import { ProviderSelectModal } from "./provider-select-modal";
import { SyncButton } from "./sync-button";

export function ConnectedBanksContent() {
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    "plaid" | "mono" | null
  >(null);

  const { data: connectedBank, isLoading: isLoadingBank } =
    useGetConnectedBank();
  const { accountsData } = useAllAccounts({ isManual: false });

  const linkedAccounts = accountsData?.filter((a) => a.plaidItemId) ?? [];

  const handleProviderSelect = (provider: "plaid" | "mono") => {
    setSelectedProvider(provider);
    setShowProviderModal(false);
  };

  if (isLoadingBank) {
    return <ConnectedBanksSkeleton />;
  }

  return (
    <>
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
      {!connectedBank && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-5">
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
            <Button
              onClick={() => setShowProviderModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Connect a Bank Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connected State */}
      {connectedBank && (
        <div className="space-y-4">
          {/* Institution Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Landmark className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {connectedBank.institutionName || "Connected Institution"}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      >
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Connected{" "}
                        {formatDistanceToNow(
                          new Date(connectedBank.createdAt),
                          {
                            addSuffix: true,
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SyncButton />
                  <DisconnectButton />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Linked Accounts ({linkedAccounts.length})
              </h4>
              <div className="space-y-2">
                {linkedAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No accounts found. Try syncing.
                  </p>
                ) : (
                  linkedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {account.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{account.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {account.type}
                            {account.subtype && ` • ${account.subtype}`}
                            {account.maskedNumber &&
                              ` • ••••${account.maskedNumber}`}
                            {" • "}
                            <span className="font-mono text-xs">
                              {account.currency}{" "}
                              {parseFloat(
                                account.balance ?? "0",
                              ).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            account.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {account.status}
                        </Badge>
                        {account.lastSyncedAt && (
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(account.lastSyncedAt),
                              {
                                addSuffix: true,
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Another Bank */}
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-border">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connect another bank</p>
                    <p className="text-xs text-muted-foreground">
                      Link multiple institutions for a complete financial
                      picture
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowProviderModal(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Bank
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Selection Modal */}
      <ProviderSelectModal
        open={showProviderModal}
        onClose={() => {
          setShowProviderModal(false);
          setSelectedProvider(null);
        }}
        onSelect={handleProviderSelect}
      />

      {/* Hidden Plaid Link (activated when plaid is selected) */}
      {selectedProvider === "plaid" && (
        <PlaidLinkButton
          onSuccess={() => {
            setSelectedProvider(null);
          }}
          onError={() => {
            setSelectedProvider(null);
          }}
        />
      )}
    </>
  );
}
