"use client";

import type { ChatContextType, ChatTopicType } from "@neuralpay/types";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const DEFAULTS = {
  search: "",
  topic: "",
  contextType: "",
  includeArchived: "false",
};

export function useChatFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: keyof typeof DEFAULTS) =>
    searchParams.get(key) ?? DEFAULTS[key];

  const currentSearch = get("search");
  const currentTopic = (get("topic") as ChatTopicType | "") || "";
  const currentContextType = (get("contextType") as ChatContextType | "") || "";
  const currentIncludeArchived = get("includeArchived") === "true";

  const activeFilterCount = [
    currentTopic !== "",
    currentContextType !== "",
    currentIncludeArchived,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const commit = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const def = DEFAULTS[key as keyof typeof DEFAULTS];
        if (!value || value === def) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  const updateSearch = useCallback(
    (value: string) => commit({ search: value }),
    [commit],
  );

  const updateTopic = useCallback(
    (value: ChatTopicType | "") => commit({ topic: value }),
    [commit],
  );

  const updateContextType = useCallback(
    (value: ChatContextType | "") => commit({ contextType: value }),
    [commit],
  );

  const updateIncludeArchived = useCallback(
    (value: boolean) => commit({ includeArchived: value ? "true" : "" }),
    [commit],
  );

  const clearAllFilters = useCallback(() => {
    router.push(pathname as Route);
  }, [pathname, router]);

  return {
    currentSearch,
    currentTopic,
    currentContextType,
    currentIncludeArchived,
    activeFilterCount,
    hasActiveFilters,
    updateSearch,
    updateTopic,
    updateContextType,
    updateIncludeArchived,
    clearAllFilters,
  };
}
