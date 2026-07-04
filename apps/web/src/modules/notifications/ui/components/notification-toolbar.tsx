"use client";

import { Button } from "@neuralpay/ui/components/button";
import { CheckCheck, MailOpen, MailPlus } from "lucide-react";
import { useMarkAllRead } from "../../hooks/mutations/use-mark-all-read-notifications";
import { useMarkManyReadNotifications } from "../../hooks/mutations/use-mark-many-read-notifications";
import { useMarkManyUnreadNotifications } from "../../hooks/mutations/use-mark-many-unread-notifications";

interface NotificationToolbarProps {
  selectedCount?: number;
  selectedIds?: string[];
  totalCount?: number;
  allNotificationIds?: string[];
  onClearSelection?: () => void;
  onSelectAll?: (ids: string[]) => void;
}

export function NotificationToolbar({
  selectedCount = 0,
  selectedIds = [],
  totalCount = 0,
  allNotificationIds = [],
  onClearSelection,
  onSelectAll,
}: NotificationToolbarProps) {
  const markAllRead = useMarkAllRead();
  const markManyRead = useMarkManyReadNotifications();
  const markManyUnread = useMarkManyUnreadNotifications();

  if (selectedCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markManyRead.mutate({ ids: selectedIds })}
            disabled={markManyRead.isPending}
          >
            <CheckCheck className="mr-1.5 size-3.5" />
            Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markManyUnread.mutate({ ids: selectedIds })}
            disabled={markManyUnread.isPending}
          >
            <MailOpen className="mr-1.5 size-3.5" />
            Unread
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={totalCount > 0 && selectedCount === totalCount}
          onChange={() => {
            if (selectedCount === totalCount && totalCount > 0) {
              onClearSelection?.();
            } else {
              onSelectAll?.(allNotificationIds);
            }
          }}
          className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
          title={selectedCount === totalCount ? "Deselect all" : "Select all"}
        />
        <span className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}`
            : "No notifications"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <MailPlus className="mr-1.5 size-3.5" />
          Mark all read
        </Button>
      </div>
    </div>
  );
}
