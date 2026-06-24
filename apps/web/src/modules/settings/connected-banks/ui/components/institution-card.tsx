import type { BankAccount, ConnectedPlaidBank } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Separator } from "@neuralpay/ui/components/separator";
import { Switch } from "@neuralpay/ui/components/switch";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Landmark, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Show } from "@/components/show";
import { AccountStatusToggle } from "@/modules/accounts/ui/components/account-status-toggle";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { useToggleInstitutionAccounts } from "../../hooks/mutations/use-toggle-institution-accounts";
import { DisconnectButton } from "./disconnect-button";
import { SyncButton } from "./sync-button";

export function InstitutionCard({
  bank,
  accounts,
  isLoadingAccounts = false,
}: {
  bank: ConnectedPlaidBank;
  accounts: BankAccount[];
  isLoadingAccounts?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<
    "active" | "inactive" | null
  >(null);
  const toggleInstitution = useToggleInstitutionAccounts();

  const institutionActive = useMemo(() => {
    if (pendingStatus !== null) return pendingStatus === "active";
    if (isLoadingAccounts) return true;
    return accounts.some((a) => a.status === "active");
  }, [accounts, isLoadingAccounts, pendingStatus]);

  const handleInstitutionToggle = (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    setPendingStatus(newStatus);
    toggleInstitution.mutate(
      { bankId: bank.id, status: newStatus },
      {
        onSettled: () => setPendingStatus(null),
        onError: () => setPendingStatus(null),
      },
    );
  };

  return (
    <Card className="bg-gray-400/5">
      <CardHeader
        className="pb-0 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Landmark className="h-5 w-5 text-main" />
            </div>
            <div>
              <div className="flex items-center gap-2 pb-1">
                <p className="text-sm font-semibold">
                  {bank.institutionName ?? "Connected Institution"}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "gap-1 text-[11px]",
                    institutionActive
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      institutionActive
                        ? "bg-emerald-500"
                        : "bg-muted-foreground",
                    )}
                  />
                  {institutionActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Connected{" "}
                {formatDistanceToNow(new Date(bank.createdAt), {
                  addSuffix: true,
                })}
                {" · "}
                {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform ml-1",
                expanded && "rotate-180",
              )}
            />
          </div>

          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={institutionActive}
              onCheckedChange={handleInstitutionToggle}
              disabled={toggleInstitution.isPending || isLoadingAccounts}
              aria-label="Toggle all accounts in this institution"
            />
            <SyncButton bankId={bank.id} />
            <DisconnectButton bankId={bank.id} />
          </div>
        </div>
      </CardHeader>

      <Show when={expanded}>
        <CardContent className="pt-4">
          <Separator className="mb-4" />
          <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Wallet className="h-3.5 w-3.5" />
            Linked accounts
          </h4>

          <Show
            when={!isLoadingAccounts}
            fallback={<InstitutionAccountsSkeleton />}
          >
            <Show
              when={accounts.length > 0}
              fallback={
                <p className="text-sm text-muted-foreground py-3 text-center">
                  No accounts found. Try syncing.
                </p>
              }
            >
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border border-border p-3 transition-colors",
                      account.status === "active"
                        ? "hover:bg-accent/50"
                        : "opacity-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {account.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          <span>{account.type}</span>
                          <span className="uppercase">
                            {account.subtype && ` · ${account.subtype}`}
                          </span>
                          {account.maskedNumber &&
                            ` · ••••${account.maskedNumber}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {account.lastSyncedAt && (
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(account.lastSyncedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                      <AccountStatusToggle
                        accountId={account.id}
                        currentStatus={account.status as "active" | "inactive"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Show>
          </Show>
        </CardContent>
      </Show>
    </Card>
  );
}

export function InstitutionAccountsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}
