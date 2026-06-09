"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";

const DEFAULTS = {
  search: "",
  type: "all",
  severity: "all",
  dismissed: "false",
  readStatus: "all",
  page: "1",
};

export function useInsightFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentValue = useCallback(
    (key: keyof typeof DEFAULTS) => {
      return searchParams.get(key) ?? DEFAULTS[key];
    },
    [searchParams],
  );

  const currentSearch = getCurrentValue("search");
  const currentType = getCurrentValue("type");
  const currentSeverity = getCurrentValue("severity");
  const currentShowDismissed = getCurrentValue("dismissed") === "true";
  const currentReadStatus = getCurrentValue("readStatus");

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];

      if (value === defaultValue || value.trim() === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("page");

      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [pathname, router, searchParams],
  );

  const hasActiveFilters =
    currentType !== "all" ||
    currentSeverity !== "all" ||
    currentSearch !== "" ||
    currentShowDismissed ||
    currentReadStatus !== "all";

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as never);
  }, [pathname, router]);

  return {
    currentSearch,
    currentType,
    currentSeverity,
    currentShowDismissed,
    currentReadStatus,
    updateFilter,
    hasActiveFilters,
    handleClearAll,
  };
}
