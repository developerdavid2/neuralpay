"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useNotifications } from "../../hooks/queries/use-notifications";
import { NotificationItem } from "./notification-item";
import { formatGroupLabel, getDateGroup, groupByDate } from "@/lib/utils";
import type { AppNotification } from "@neuralpay/types";
import { Bell } from "lucide-react";
import { useMemo, useEffect } from "react";

interface NotificationListProps {
  currentSearch: string;
  currentCategory: "all" | AppNotification["category"];
  currentStatus: "all" | "read" | "unread";
  currentLimit: number;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onTotalCountChange?: (count: number) => void;
  onAllNotificationIdsChange?: (ids: string[]) => void;
}

export function NotificationList({
  currentSearch,
  currentCategory,
  currentStatus,
  currentLimit,
  selectedIds,
  onSelect,
  onAllNotificationIdsChange,
}: NotificationListProps) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNotifications({
      limit: currentLimit,
      search: currentSearch.trim() || undefined,
      category: currentCategory === "all" ? "all" : currentCategory,
      status: currentStatus,
    });

  const notifications = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages.flatMap((page) => page.items) ?? []).filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [data]);

  const grouped = useMemo(
    () =>
      groupByDate(notifications, (n: AppNotification) =>
        getDateGroup(new Date(n.createdAt)),
      ),
    [notifications],
  );

  const allNotificationIds = useMemo(
    () => notifications.map((n) => n.id),
    [notifications],
  );

  useEffect(() => {
    onAllNotificationIdsChange?.(allNotificationIds);
  }, [allNotificationIds, onAllNotificationIdsChange]);

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="mb-5 rounded-full bg-accent/60 p-5">
          <Bell className="size-10 opacity-30" />
        </div>
        <p className="text-lg font-medium">No notifications found</p>
        <p className="mt-1 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <div className="bg-muted/40 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {formatGroupLabel(group as any)}
          </div>
          <div className="divide-y divide-border/60">
            {(items as AppNotification[]).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                selectable
                selected={selectedIds.has(notification.id)}
                onSelect={(id, checked) => onSelect(id, checked)}
                variant="full"
              />
            ))}
          </div>
        </div>
      ))}

      <InfiniteScroll
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={false}
        isManual={true}
        hideEndMessage={false}
      />
    </div>
  );
}

export function NotificationListSkeleton() {
  return (
    <div className="space-y-4 px-6 py-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border/70 p-4">
          <div className="h-3 w-22 rounded bg-muted" />
          <div className="mt-3 h-4 w-full rounded bg-muted/80" />
          <div className="mt-2 h-4 w-4/5 rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
