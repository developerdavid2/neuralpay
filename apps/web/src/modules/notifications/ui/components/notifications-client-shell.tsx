"use client";

import { SectionBoundary } from "@/components/section-boundary";
import { useNotificationFilters } from "../../hooks/use-notification-filters";
import { useNotificationsSummary } from "../../hooks/queries/use-notifications-summary";
import { NotificationFilters } from "./notification-filters";
import {
  NotificationList,
  NotificationListSkeleton,
} from "./notification-list";
import { NotificationToolbar } from "./notification-toolbar";
import { useCallback, useMemo, useState } from "react";

export function NotificationsClientShell() {
  const {
    currentSearch,
    currentCategory,
    currentStatus,
    currentLimit,
    updateFilter,
    hasActiveFilters,
    handleClearFilters,
  } = useNotificationFilters();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allNotificationIds, setAllNotificationIds] = useState<string[]>([]);

  const { data: summary } = useNotificationsSummary({
    search: currentSearch || undefined,
    category: currentCategory,
    status: currentStatus,
  });

  const totalCount = summary?.total ?? 0;
  const unreadCount = summary?.unread ?? 0;

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) =>
      prev.size === ids.length && ids.length > 0 ? new Set() : new Set(ids),
    );
  }, []);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="shrink-0 border-b border-border px-6 py-4">
        <NotificationFilters
          currentSearch={currentSearch}
          currentCategory={currentCategory}
          currentStatus={currentStatus}
          currentLimit={currentLimit}
          unreadCount={unreadCount}
          updateFilter={updateFilter}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="shrink-0 border-b border-border px-6 py-3">
        <NotificationToolbar
          selectedCount={selectedIds.size}
          unreadCount={unreadCount}
          selectedIds={selectedArray}
          totalCount={totalCount}
          allNotificationIds={allNotificationIds}
          onClearSelection={() => setSelectedIds(new Set())}
          onSelectAll={handleSelectAll}
        />
      </div>

      <SectionBoundary
        key={`${currentSearch}-${currentCategory}-${currentStatus}-${currentLimit}`}
        fallback={<NotificationListSkeleton />}
        errorMessage="Could not load notifications"
      >
        <NotificationList
          currentSearch={currentSearch}
          currentCategory={currentCategory}
          currentStatus={currentStatus}
          currentLimit={currentLimit}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onAllNotificationIdsChange={setAllNotificationIds}
        />
      </SectionBoundary>
    </div>
  );
}
