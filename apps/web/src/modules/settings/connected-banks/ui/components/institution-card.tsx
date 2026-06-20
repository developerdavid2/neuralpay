import type { BankAccount, ConnectedPlaidBank } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Separator } from "@neuralpay/ui/components/separator";
import { cn } from "@neuralpay/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { DisconnectButton } from "./disconnect-button";
import { SyncButton } from "./sync-button";

export function InstitutionCard({
  bank,
  accounts,
}: {
  bank: ConnectedPlaidBank;
  accounts: BankAccount[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      className="bg-gray-400/5 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          {/* Left: toggle + name */}
          <button className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 pb-1">
                <p className="text-sm font-semibold">
                  {bank.institutionName ?? "Connected Institution"}
                </p>
                <Badge
                  variant="secondary"
                  className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[11px]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
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
          </button>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <SyncButton bankId={bank.id} />
            <DisconnectButton bankId={bank.id} />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4">
          <Separator className="mb-4" />
          <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Wallet className="h-3.5 w-3.5" />
            Linked accounts
          </h4>
          <div className="space-y-2">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center">
                No accounts found. Try syncing.
              </p>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
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

                        <span>
                          {account.maskedNumber &&
                            ` · ••••${account.maskedNumber}`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        account.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {account.status}
                    </Badge>
                    {account.lastSyncedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(account.lastSyncedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
