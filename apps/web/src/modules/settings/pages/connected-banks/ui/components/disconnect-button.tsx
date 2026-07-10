"use client";

import { Unlink } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useDisconnectBank } from "../../hooks/mutations/use-disconnect-bank";
import { toast } from "sonner";

export function DisconnectButton({ bankId }: { bankId: string }) {
  const disconnectMutation = useDisconnectBank();
  const [ConfirmDialog, confirm] = useConfirm();

  const handleDisconnect = async () => {
    const ok = await confirm({
      title: "Disconnect this institution",
      message:
        "This will disconnect all linked accounts for this institution and stop transaction syncing. Continue?",
      confirmLabel: "Disconnect",
      variant: "destructive",
    });
    if (!ok) return;

    disconnectMutation.mutate(
      { bankId },
      {
        onSuccess: () => toast.success("Institution disconnected"),
        onError: () => toast.error("Failed to disconnect institution"),
      },
    );
  };

  return (
    <>
      <ConfirmDialog />
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
    </>
  );
}
