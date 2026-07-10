"use client";

import { parseUserAgent } from "@/lib/parse-user-agent";
import type { SessionInfo } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { Button } from "@neuralpay/ui/components/button";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

export function SessionItem({
  session,
  onRevoke,
  isRevoking,
}: {
  session: SessionInfo;
  onRevoke: (token: string) => void;
  isRevoking: boolean;
}) {
  const {
    label,
    icon: Icon,
    platformIcon: PlatformIcon,
  } = parseUserAgent(session.userAgent);

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-border bg-main-tint rounded-xl">
      <div className="flex items-center gap-3 max-w-[300px]">
        <div className="relative shrink-0">
          <Icon className="size-8 text-muted-foreground" />
          <PlatformIcon className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background p-[1px] text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">
            {session.ipAddress ?? "Unknown IP"} ·{" "}
            {formatDistanceToNow(session.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {session.isCurrent ? (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs shrink-0"
        >
          Current
        </Badge>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.token)}
          disabled={isRevoking}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          {isRevoking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Sign Out"
          )}
        </Button>
      )}
    </div>
  );
}
