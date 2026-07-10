"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Button } from "@neuralpay/ui/components/button";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { toast } from "sonner";
import { useSessions } from "../../hooks/queries/use-sessions";
import { useRevokeSession } from "../../hooks/mutations/use-revoke-session";
import { useRevokeOthers } from "../../hooks/mutations/use-revoke-others";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { parseUserAgent } from "@/lib/parse-user-agent";
import { SessionItem } from "./session-item";

export function ActiveSessionsSection() {
  const { data: sessions } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOthers();
  const [ConfirmDialog, confirm] = useConfirm();

  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleRevoke = async (token: string) => {
    const session = sessions?.find((s) => s.token === token);
    const label = session?.userAgent
      ? parseUserAgent(session.userAgent).label
      : "this device";

    const ok = await confirm({
      title: "Sign out this device",
      message: `This will sign you out of "${label}". Continue?`,
      confirmLabel: "Sign Out",
      variant: "destructive",
    });
    if (!ok) return;

    setPendingKey(token);
    revokeSession.mutate(
      { sessionToken: token },
      {
        onSuccess: () => toast.success("Device signed out"),
        onError: () => toast.error("Failed to sign out device"),
        onSettled: () => setPendingKey(null),
      },
    );
  };

  const handleRevokeOthers = async () => {
    const ok = await confirm({
      title: "Sign out all other devices",
      message: "This will sign you out of all other devices. Continue?",
      confirmLabel: "Sign Out",
      variant: "destructive",
    });
    if (!ok) return;

    setPendingKey("__all__");
    revokeOthers.mutate(undefined, {
      onSuccess: () => toast.success("Signed out of all other devices"),
      onError: () => toast.error("Failed to update"),
      onSettled: () => setPendingKey(null),
    });
  };

  const otherSessionsCount = sessions?.filter((s) => !s.isCurrent).length ?? 0;

  return (
    <Card className="bg-card shadow-none drop-shadow-sm">
      <ConfirmDialog />
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Active Sessions</p>
        <p className="text-sm text-muted-foreground">
          Devices currently signed in to your account.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {sessions?.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={handleRevoke}
              isRevoking={pendingKey === session.token}
            />
          ))}
        </div>

        {otherSessionsCount > 0 && (
          <div className="pt-4">
            <Button
              onClick={handleRevokeOthers}
              disabled={pendingKey === "__all__"}
              className="w-full text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/20"
            >
              {pendingKey === "__all__"
                ? "Signing out..."
                : "Sign Out All Other Devices"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ActiveSessionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="size-5 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}
