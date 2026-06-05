"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";

export function useDataTableNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const navigate = useCallback(
    (
      updates: Record<string, string | null>,
      options?: { scroll?: boolean },
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;

      router.push(newUrl as Route, { scroll: options?.scroll ?? false });
    },
    [searchParams, pathname, router],
  );

  const setPage = useCallback(
    (page: number) => navigate({ page: String(page) }),
    [navigate],
  );

  const setLimit = useCallback(
    (limit: number) => navigate({ limit: String(limit), page: null }),
    [navigate],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => navigate({ [key]: value }),
    [navigate],
  );

  return { navigate, setPage, setLimit, setParam };
}
