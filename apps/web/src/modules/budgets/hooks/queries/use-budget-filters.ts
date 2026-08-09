"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { BudgetQueryState } from "../../types";

const DEFAULTS = {
  search: "",
  status: "",
  isActive: "",
  period: "",
  sortField: "date",
  sortDir: "desc",
  limit: "20",
};

export function useBudgetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [draftIsActive, setDraftIsActive] = useState<boolean | undefined>(
    undefined,
  );
  const [draftPeriod, setDraftPeriod] = useState<string | undefined>(undefined);

  const get = (key: keyof typeof DEFAULTS) =>
    searchParams.get(key) ?? DEFAULTS[key];

  const currentSearch = get("search");
  const currentStatuses = (searchParams.get("status") ?? "")
    .split(",")
    .filter(Boolean);
  const rawIsActive = searchParams.get("isActive");
  const currentIsActive =
    rawIsActive === "true" ? true : rawIsActive === "false" ? false : undefined;
  const currentPeriod = searchParams.get("period") || undefined;
  const currentSortField = get("sortField") as BudgetQueryState["sortField"];
  const currentSortDir = get("sortDir") as BudgetQueryState["sortDir"];
  const currentLimit = Number(get("limit")) || 20;

  const activeFilterCount = [
    currentStatuses.length > 0,
    currentIsActive !== undefined,
    !!currentPeriod,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const commit = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const def = DEFAULTS[key as keyof typeof DEFAULTS];

      if (!value || value === def) params.delete(key);
      else params.set(key, value);

      params.delete("page");
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  const updateSearch = useCallback(
    (value: string) => commit("search", value),
    [commit],
  );

  // Clicking an already-active sort field flips direction; picking a new field defaults to desc
  const updateSort = useCallback(
    (field: string, dir: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (field === DEFAULTS.sortField) params.delete("sortField");
      else params.set("sortField", field);
      if (dir === DEFAULTS.sortDir) params.delete("sortDir");
      else params.set("sortDir", dir);
      params.delete("page");
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  const openDrawer = useCallback(() => {
    setDraftStatuses(currentStatuses);
    setDraftIsActive(currentIsActive);
    setDraftPeriod(currentPeriod);
    setMoreFiltersOpen(true);
  }, [currentStatuses, currentIsActive, currentPeriod]);

  const closeDrawer = useCallback(() => setMoreFiltersOpen(false), []);

  const toggleDraftStatus = useCallback((status: string) => {
    setDraftStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  }, []);

  const applyDrawerFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (draftStatuses.length > 0) params.set("status", draftStatuses.join(","));
    else params.delete("status");

    if (draftIsActive !== undefined)
      params.set("isActive", String(draftIsActive));
    else params.delete("isActive");

    if (draftPeriod) params.set("period", draftPeriod);
    else params.delete("period");

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
    setMoreFiltersOpen(false);
  }, [
    searchParams,
    pathname,
    router,
    draftStatuses,
    draftIsActive,
    draftPeriod,
  ]);

  const resetDrawer = useCallback(() => {
    setDraftStatuses([]);
    setDraftIsActive(undefined);
    setDraftPeriod(undefined);

    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const sortField = searchParams.get("sortField");
    if (sortField) params.set("sortField", sortField);
    const sortDir = searchParams.get("sortDir");
    if (sortDir) params.set("sortDir", sortDir);

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
    setMoreFiltersOpen(false);
  }, [pathname, router, searchParams]);

  // Same-shape state your BudgetList/useBudgetsList already expects
  const queryState: BudgetQueryState = useMemo(
    () => ({
      limit: currentLimit,
      search: currentSearch,
      statuses: currentStatuses as BudgetQueryState["statuses"],
      isActive: currentIsActive,
      period: currentPeriod as BudgetQueryState["period"],
      sortField: currentSortField,
      sortDir: currentSortDir,
    }),
    [
      currentLimit,
      currentSearch,
      currentStatuses,
      currentIsActive,
      currentPeriod,
      currentSortField,
      currentSortDir,
    ],
  );

  return {
    queryState,
    currentSearch,
    currentStatuses,
    currentIsActive,
    currentPeriod,
    currentSortField,
    currentSortDir,

    draftStatuses,
    draftIsActive,
    draftPeriod,

    moreFiltersOpen,

    updateSearch,
    updateSort,

    openDrawer,
    closeDrawer,
    toggleDraftStatus,
    setDraftIsActive,
    setDraftPeriod,
    applyDrawerFilters,
    resetDrawer,

    activeFilterCount,
    hasActiveFilters,
  };
}
