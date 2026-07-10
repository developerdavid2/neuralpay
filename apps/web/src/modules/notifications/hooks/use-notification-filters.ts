"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { NotificationCategory } from "@neuralpay/types";

const DEFAULTS = {
  search: "",
  category: "all",
  status: "all",
  limit: "20",
};

export function useNotificationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? DEFAULTS.search;
  const currentCategory = (searchParams.get("category") ??
    DEFAULTS.category) as NotificationCategory | "all";
  const currentStatus = (searchParams.get("status") ?? DEFAULTS.status) as
    | "all"
    | "read"
    | "unread";
  const currentLimit = Number(searchParams.get("limit") ?? DEFAULTS.limit);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];

      if (value === defaultValue || value.trim() === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [pathname, router, searchParams],
  );

  const hasActiveFilters =
    currentSearch !== "" ||
    currentCategory !== "all" ||
    currentStatus !== "all";

  const handleClearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as never);
  }, [pathname, router]);

  return {
    currentSearch,
    currentCategory,
    currentStatus,
    currentLimit,
    updateFilter,
    hasActiveFilters,
    handleClearFilters,
  };
}
