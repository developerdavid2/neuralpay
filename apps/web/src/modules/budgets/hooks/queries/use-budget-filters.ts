"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  validateBudgetPeriod,
  validateBudgetStatuses,
  validateSortField,
} from "../../lib/validate-budget-params";
import type { BudgetQueryState } from "../../types";

const DEFAULTS = {
  search: "",
  status: "",
  isActive: "",
  period: "",
  month: "",
  year: "",
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
  const currentStatuses =
    validateBudgetStatuses(searchParams.get("status") ?? undefined) ?? [];

  const rawIsActive = searchParams.get("isActive");
  const currentIsActive =
    rawIsActive === "true" ? true : rawIsActive === "false" ? false : undefined;
  const currentPeriod = validateBudgetPeriod(
    searchParams.get("period") ?? undefined,
  );
  const currentMonth = searchParams.get("month")
    ? Number(searchParams.get("month"))
    : undefined;
  const currentYear = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;

  const currentSortField = (validateSortField(get("sortField")) ??
    DEFAULTS.sortField) as BudgetQueryState["sortField"];

  const currentSortDir = (
    get("sortDir") === "asc" ? "asc" : "desc"
  ) as BudgetQueryState["sortDir"];

  const currentLimit = Number(get("limit")) || 20;

  const activeFilterCount = [
    currentStatuses.length > 0,
    currentIsActive !== undefined,
    !!currentPeriod,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;
  const hasActiveSorters =
    currentSortField !== DEFAULTS.sortField ||
    currentSortDir !== DEFAULTS.sortDir;

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

  const updateMonthYear = useCallback(
    (newMonth: number, newYear: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", String(newMonth));
      params.set("year", String(newYear));
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
    setMoreFiltersOpen(false);

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
  }, [
    searchParams,
    pathname,
    router,
    draftStatuses,
    draftIsActive,
    draftPeriod,
  ]);

  const resetDrawer = useCallback(() => {
    setMoreFiltersOpen(false);
    setDraftStatuses([]);
    setDraftIsActive(undefined);
    setDraftPeriod(undefined);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("isActive");
    params.delete("period");
    params.delete("page");
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  }, [pathname, router, searchParams]);

  const queryState: BudgetQueryState = useMemo(
    () => ({
      limit: currentLimit,
      search: currentSearch,
      statuses: currentStatuses as BudgetQueryState["statuses"],
      isActive: currentIsActive,
      period: currentPeriod as BudgetQueryState["period"],
      month: currentMonth,
      year: currentYear,
      sortField: currentSortField,
      sortDir: currentSortDir,
    }),
    [
      currentLimit,
      currentSearch,
      currentStatuses,
      currentIsActive,
      currentPeriod,
      currentMonth,
      currentYear,
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
    currentMonth,
    currentYear,
    currentSortField,
    currentSortDir,

    draftStatuses,
    draftIsActive,
    draftPeriod,

    moreFiltersOpen,

    updateSearch,
    updateSort,
    updateMonthYear,

    openDrawer,
    closeDrawer,
    toggleDraftStatus,
    setDraftIsActive,
    setDraftPeriod,
    applyDrawerFilters,
    resetDrawer,

    activeFilterCount,
    hasActiveFilters,
    hasActiveSorters,
  };
}
