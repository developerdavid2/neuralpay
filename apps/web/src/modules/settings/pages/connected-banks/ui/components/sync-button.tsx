"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";
import { useSyncTransactions } from "../../hooks/mutations/use-sync-transactions";

export function SyncButton({ bankId }: { bankId: string }) {
  const syncMutation = useSyncTransactions();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => syncMutation.mutate({ bankId })}
      disabled={syncMutation.isPending}
      className="gap-1.5"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${syncMutation.isPending ? "" : ""}`}
      />
      {syncMutation.isPending ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
