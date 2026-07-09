"use client";

import { Unlink } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";
import { useDisconnectBank } from "../../hooks/mutations/use-disconnect-bank";

export function DisconnectButton({ bankId }: { bankId: string }) {
  const disconnectMutation = useDisconnectBank();

  const handleDisconnect = () => {
    if (
      confirm(
        "Are you sure? This will disconnect all linked accounts for this institution and stop transaction syncing.",
      )
    ) {
      disconnectMutation.mutate({ bankId });
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDisconnect}
      disabled={disconnectMutation.isPending}
      className="gap-1.5"
    >
      <Unlink className="h-3.5 w-3.5" />
      {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
    </Button>
  );
}
