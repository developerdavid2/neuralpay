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

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

  if (selectedCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2.5">
          {/* Checkbox reflects all/partial state */}
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isPartialSelected;
            }}
            onChange={() => {
              if (isAllSelected) onClearSelection?.();
              else onSelectAll?.(allNotificationIds);
            }}
            className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
          />
          <span className="text-sm font-medium">{selectedCount} selected</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Always show mark as read */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markManyRead.mutate({ ids: selectedIds })}
            disabled={markManyRead.isPending}
          >
            <CheckCheck className="mr-1.5 size-3.5" />
            Mark read
          </Button>

          {/* Only show mark as unread for partial selection, not select-all */}
          {!isAllSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markManyUnread.mutate({ ids: selectedIds })}
              disabled={markManyUnread.isPending}
            >
              <MailOpen className="mr-1.5 size-3.5" />
              Mark unread
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={false}
          onChange={() => onSelectAll?.(allNotificationIds)}
          className="rounded border-input h-4 w-4 accent-primary cursor-pointer"
          title="Select all"
          disabled={totalCount === 0}
        />
        <span className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}`
            : "No notifications"}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => markAllRead.mutate()}
        disabled={markAllRead.isPending || totalCount === 0}
      >
        <MailPlus className="mr-1.5 size-3.5" />
        Mark all read
      </Button>
    </div>
  );
}
