"use client";

import { SectionBoundary } from "@/components/section-boundary";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { NotificationFilters } from "./notification-filters";
import {
  NotificationList,
  NotificationListSkeleton,
} from "./notification-list";
import { NotificationToolbar } from "./notification-toolbar";
import type { NotificationCategory } from "@neuralpay/types";

interface NotificationsClientShellProps {
  initialSearch: string;
  initialCategory: NotificationCategory | "all";
  initialStatus: "all" | "read" | "unread";
  initialLimit: number;
}

export function NotificationsClientShell({
  initialSearch,
  initialCategory,
  initialStatus,
  initialLimit,
}: NotificationsClientShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<NotificationCategory | "all">(
    initialCategory,
  );
  const [status, setStatus] = useState<"all" | "read" | "unread">(
    initialStatus,
  );
  const [limit, setLimit] = useState(initialLimit);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [allNotificationIds, setAllNotificationIds] = useState<string[]>([]);

  const updateParams = useCallback(
    (next: {
      search?: string;
      category?: NotificationCategory | "all";
      status?: "all" | "read" | "unread";
      limit?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.search !== undefined) {
        if (next.search) params.set("search", next.search);
        else params.delete("search");
      }

      if (next.category !== undefined) {
        if (next.category === "all") params.delete("category");
        else params.set("category", next.category);
      }

      if (next.status !== undefined) {
        if (next.status === "all") params.delete("status");
        else params.set("status", next.status);
      }

      if (next.limit !== undefined) {
        params.set("limit", String(next.limit));
      }

      router.replace(`/dashboard/notifications?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      updateParams({ search: value, category, status, limit });
    },
    [category, limit, status, updateParams],
  );

  const handleCategory = useCallback(
    (value: NotificationCategory | "all") => {
      setCategory(value);
      updateParams({ search, category: value, status, limit });
    },
    [limit, search, status, updateParams],
  );

  const handleStatus = useCallback(
    (value: "all" | "read" | "unread") => {
      setStatus(value);
      updateParams({ search, category, status: value, limit });
    },
    [category, limit, search, updateParams],
  );

  const handleLimit = useCallback(
    (value: number) => {
      setLimit(value);
      updateParams({ search, category, status, limit: value });
    },
    [category, search, status, updateParams],
  );

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      if (prev.size === ids.length && ids.length > 0) {
        return new Set();
      }
      return new Set(ids);
    });
  }, []);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="shrink-0 border-b border-border px-6 py-4">
        <NotificationFilters
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
          currentLimit={limit}
          onSearchChange={handleSearch}
          onCategoryChange={handleCategory}
          onStatusChange={handleStatus}
          onLimitChange={handleLimit}
        />
      </div>

      <div className="shrink-0 border-b border-border px-6 py-3">
        <NotificationToolbar
          selectedCount={selectedIds.size}
          selectedIds={selectedArray}
          totalCount={totalCount}
          allNotificationIds={allNotificationIds}
          onClearSelection={() => setSelectedIds(new Set())}
          onSelectAll={handleSelectAll}
        />
      </div>

      <SectionBoundary
        fallback={<NotificationListSkeleton />}
        errorMessage="Could not load notifications"
      >
        <NotificationList
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
          currentLimit={limit}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onTotalCountChange={setTotalCount}
          onSelectAll={handleSelectAll}
          onAllNotificationIdsChange={setAllNotificationIds}
        />
      </SectionBoundary>
    </div>
  );
}
