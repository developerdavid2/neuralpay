import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";

const DEFAULTS = {
  search: "",
  types: "",
  statuses: "",
  accountType: "all",
  accountId: "",
  dateFrom: "",
  dateTo: "",
  categories: "",
  isManual: "false",
  isAnomaly: "false",
  amountMin: "",
  amountMax: "",
};

export function useTransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // ── Draft state (drawer scratchpad)
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [draftTransactionTypes, setDraftTransactionTypes] = useState<string[]>(
    [],
  );
  const [draftIsManual, setDraftIsManual] = useState(false);
  const [draftIsAnomaly, setDraftIsAnomaly] = useState(false);
  const [draftAmountMin, setDraftAmountMin] = useState("");
  const [draftAmountMax, setDraftAmountMax] = useState("");

  // ── Read committed values from URL
  const get = (key: keyof typeof DEFAULTS) =>
    searchParams.get(key) ?? DEFAULTS[key];

  const currentSearch = get("search");
  const currentTypes = searchParams.get("types")
    ? searchParams.get("types")!.split(",").filter(Boolean)
    : [];
  const currentStatuses = searchParams.get("statuses")
    ? searchParams.get("statuses")!.split(",").filter(Boolean)
    : [];
  const currentAccountType = get("accountType");
  const currentAccountId = get("accountId");
  const currentDateFrom = get("dateFrom");
  const currentDateTo = get("dateTo");
  const currentCategories = searchParams.get("categories")
    ? searchParams.get("categories")!.split(",").filter(Boolean)
    : [];
  const currentIsManual = get("isManual") === "true";
  const currentIsAnomaly = get("isAnomaly") === "true";
  const currentAmountMin = get("amountMin");
  const currentAmountMax = get("amountMax");

  const activeFilterCount = [
    currentAccountType !== "all",
    currentTypes.length > 0,
    currentStatuses.length > 0,
    currentAccountId !== "",
    currentDateFrom !== "",
    currentDateTo !== "",
    currentCategories.length > 0,
    currentIsManual,
    currentIsAnomaly,
    currentAmountMin !== "",
    currentAmountMax !== "",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const dateRange: DateRange | undefined =
    currentDateFrom && currentDateTo
      ? { from: new Date(currentDateFrom), to: new Date(currentDateTo) }
      : undefined;

  // ── Single-param commit (for immediate actions)
  const commit = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      const def = DEFAULTS[key as keyof typeof DEFAULTS];
      const str = Array.isArray(value) ? value.join(",") : value;

      if (!str || str === def || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, str);
      }

      params.delete("page");
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [pathname, router, searchParams],
  );

  // ── Immediate filter actions
  const updateSearch = useCallback(
    (value: string) => commit("search", value),
    [commit],
  );

  const updateAccountType = useCallback(
    (value: string) => commit("accountType", value),
    [commit],
  );

  const updateDateRange = useCallback(
    (range: DateRange | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (range?.from) {
        params.set("dateFrom", range.from.toISOString());
      } else {
        params.delete("dateFrom");
      }
      if (range?.to) {
        params.set("dateTo", range.to.toISOString());
      } else {
        params.delete("dateTo");
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [pathname, router, searchParams],
  );

  const updateTransactionTypes = useCallback(
    (values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (values.length === 0) {
        params.delete("types");
      } else {
        params.set("types", values.join(","));
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [searchParams, pathname, router],
  );

  const updateStatuses = useCallback(
    (values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (values.length === 0) {
        params.delete("statuses");
      } else {
        params.set("statuses", values.join(","));
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [searchParams, pathname, router],
  );

  const updateCategories = useCallback(
    (values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (values.length === 0) {
        params.delete("categories");
      } else {
        params.set("categories", values.join(","));
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as never);
    },
    [searchParams, pathname, router],
  );

  // ── Missing actions that were causing the error
  const updateIsManual = useCallback(
    (value: boolean) => commit("isManual", value ? "true" : ""),
    [commit],
  );

  const updateIsAnomaly = useCallback(
    (value: boolean) => commit("isAnomaly", value ? "true" : ""),
    [commit],
  );

  const updateAmountMin = useCallback(
    (value: string) => commit("amountMin", value),
    [commit],
  );

  const updateAmountMax = useCallback(
    (value: string) => commit("amountMax", value),
    [commit],
  );

  // ── Drawer actions
  const openDrawer = useCallback(() => {
    setDraftCategories(currentCategories);
    setDraftStatuses(currentStatuses);
    setDraftTransactionTypes(currentTypes);
    setDraftIsManual(currentIsManual);
    setDraftIsAnomaly(currentIsAnomaly);
    setDraftAmountMin(currentAmountMin);
    setDraftAmountMax(currentAmountMax);
    setMoreFiltersOpen(true);
  }, [
    currentCategories,
    currentStatuses,
    currentTypes,
    currentIsManual,
    currentIsAnomaly,
    currentAmountMin,
    currentAmountMax,
  ]);

  const closeDrawer = useCallback(() => setMoreFiltersOpen(false), []);

  const toggleDraftCategory = useCallback((cat: string) => {
    setDraftCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const toggleDraftStatus = useCallback((status: string) => {
    setDraftStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  }, []);

  const toggleDraftTransactionType = useCallback((type: string) => {
    setDraftTransactionTypes((prev) =>
      prev.includes(type) ? prev.filter((v) => v !== type) : [...prev, type],
    );
  }, []);

  const toggleDraftManual = useCallback(() => {
    setDraftIsManual((prev) => !prev);
  }, []);

  const toggleDraftAnomaly = useCallback(() => {
    setDraftIsAnomaly((prev) => !prev);
  }, []);

  const updateDraftMinAmount = useCallback((value: string) => {
    setDraftAmountMin(value);
  }, []);

  const updateDraftMaxAmount = useCallback((value: string) => {
    setDraftAmountMax(value);
  }, []);

  // ── Apply all drawer filters in ONE router.push
  const applyDrawerFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (draftTransactionTypes.length > 0) {
      params.set("types", draftTransactionTypes.join(","));
    } else {
      params.delete("types");
    }

    if (draftStatuses.length > 0) {
      params.set("statuses", draftStatuses.join(","));
    } else {
      params.delete("statuses");
    }

    if (draftCategories.length > 0) {
      params.set("categories", draftCategories.join(","));
    } else {
      params.delete("categories");
    }

    if (draftIsManual) {
      params.set("isManual", "true");
    } else {
      params.delete("isManual");
    }

    if (draftIsAnomaly) {
      params.set("isAnomaly", "true");
    } else {
      params.delete("isAnomaly");
    }

    if (draftAmountMin) {
      params.set("amountMin", draftAmountMin);
    } else {
      params.delete("amountMin");
    }

    if (draftAmountMax) {
      params.set("amountMax", draftAmountMax);
    } else {
      params.delete("amountMax");
    }

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as never);
    setMoreFiltersOpen(false);
  }, [
    searchParams,
    pathname,
    router,
    draftTransactionTypes,
    draftStatuses,
    draftCategories,
    draftIsManual,
    draftIsAnomaly,
    draftAmountMin,
    draftAmountMax,
  ]);

  // ── Reset all filters in ONE router.push
  const resetDrawer = useCallback(() => {
    setDraftCategories([]);
    setDraftStatuses([]);
    setDraftTransactionTypes([]);
    setDraftIsManual(false);
    setDraftIsAnomaly(false);
    setDraftAmountMin("");
    setDraftAmountMax("");

    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as never);
    setMoreFiltersOpen(false);
  }, [pathname, router, searchParams]);

  const clearAllFilters = useCallback(() => {
    setDraftCategories([]);
    setDraftStatuses([]);
    setDraftTransactionTypes([]);
    setDraftIsManual(false);
    setDraftIsAnomaly(false);
    setDraftAmountMin("");
    setDraftAmountMax("");
    router.push(pathname as never);
  }, [pathname, router]);

  return {
    // Committed state
    currentSearch,
    currentTypes,
    currentStatuses,
    currentAccountType,
    currentAccountId,
    currentDateFrom,
    currentDateTo,
    currentCategories,
    currentIsManual,
    currentIsAnomaly,
    currentAmountMin,
    currentAmountMax,

    // Draft state
    draftCategories,
    draftStatuses,
    draftTransactionTypes,
    draftIsManual,
    draftIsAnomaly,
    draftAmountMin,
    draftAmountMax,

    // UI state
    moreFiltersOpen,

    // Immediate actions
    updateSearch,
    updateAccountType,
    updateTransactionTypes,
    updateStatuses,
    updateCategories,
    updateDateRange,
    updateIsManual,
    updateIsAnomaly,
    updateAmountMin,
    updateAmountMax,
    clearAllFilters,

    // Drawer actions
    openDrawer,
    closeDrawer,
    toggleDraftCategory,
    toggleDraftStatus,
    toggleDraftTransactionType,
    toggleDraftManual,
    toggleDraftAnomaly,
    updateDraftMinAmount,
    updateDraftMaxAmount,
    applyDrawerFilters,
    resetDrawer,
    setDraftTransactionTypes,
    setDraftCategories,
    setDraftStatuses,

    // Computed
    activeFilterCount,
    hasActiveFilters,
    dateRange,
  };
}
