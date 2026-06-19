"use client";

import { Unlink } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";
import { useDisconnectBank } from "../../hooks/mutations/use-disconnect-bank";

export function DisconnectButton() {
  const disconnectMutation = useDisconnectBank();

  const handleDisconnect = () => {
    if (
      confirm(
        "Are you sure? This will disconnect all linked accounts and stop transaction syncing.",
      )
    ) {
      disconnectMutation.mutate();
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
