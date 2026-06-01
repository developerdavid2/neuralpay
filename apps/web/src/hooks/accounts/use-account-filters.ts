import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const DEFAULTS = {
  search: "",
  types: "",
  statuses: "",
  isManual: "false",
};

export function useAccountFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const [draftTypes, setDraftTypes] = useState<string[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [draftIsManual, setDraftIsManual] = useState(false);

  const get = (key: keyof typeof DEFAULTS) =>
    searchParams.get(key) ?? DEFAULTS[key];

  const currentSearch = get("search");
  const currentTypes = searchParams.get("types")
    ? searchParams.get("types")!.split(",").filter(Boolean)
    : [];
  const currentStatuses = searchParams.get("statuses")
    ? searchParams.get("statuses")!.split(",").filter(Boolean)
    : [];
  const currentIsManual = get("isManual") === "true";

  const activeFilterCount = [
    currentTypes.length > 0,
    currentStatuses.length > 0,
    currentIsManual,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

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
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router, searchParams],
  );

  // ── Immediate filter actions
  const updateSearch = useCallback(
    (value: string) => commit("search", value),
    [commit],
  );

  const updateTypes = useCallback(
    (values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (values.length === 0) {
        params.delete("types");
      } else {
        params.set("types", values.join(","));
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
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

  const updateIsManual = useCallback(
    (value: boolean) => commit("isManual", value ? "true" : ""),
    [commit],
  );

  // ── Drawer actions
  const openDrawer = useCallback(() => {
    setDraftTypes(currentTypes);
    setDraftStatuses(currentStatuses);
    setDraftIsManual(currentIsManual);
    setMoreFiltersOpen(true);
  }, [currentTypes, currentStatuses, currentIsManual]);

  const closeDrawer = useCallback(() => setMoreFiltersOpen(false), []);

  const toggleDraftType = useCallback((type: string) => {
    setDraftTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const toggleDraftStatus = useCallback((status: string) => {
    setDraftStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  }, []);

  const toggleDraftManual = useCallback(() => {
    setDraftIsManual((prev) => !prev);
  }, []);

  const applyDrawerFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (draftTypes.length > 0) {
      params.set("types", draftTypes.join(","));
    } else {
      params.delete("types");
    }

    if (draftStatuses.length > 0) {
      params.set("statuses", draftStatuses.join(","));
    } else {
      params.delete("statuses");
    }

    if (draftIsManual) {
      params.set("isManual", "true");
    } else {
      params.delete("isManual");
    }

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
    setMoreFiltersOpen(false);
  }, [
    searchParams,
    pathname,
    router,
    draftTypes,
    draftStatuses,
    draftIsManual,
  ]);

  const resetDrawer = useCallback(() => {
    setDraftTypes([]);
    setDraftStatuses([]);
    setDraftIsManual(false);

    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
    setMoreFiltersOpen(false);
  }, [pathname, router, searchParams]);

  const clearAllFilters = useCallback(() => {
    setDraftTypes([]);
    setDraftStatuses([]);
    setDraftIsManual(false);
    router.push(pathname as Route);
  }, [pathname, router]);

  return {
    // Committed state
    currentSearch,
    currentTypes,
    currentStatuses,
    currentIsManual,

    // Draft state
    draftTypes,
    draftStatuses,
    draftIsManual,

    // UI state
    moreFiltersOpen,

    // Immediate actions
    updateSearch,
    updateTypes,
    updateStatuses,
    updateIsManual,
    clearAllFilters,

    // Drawer actions
    openDrawer,
    closeDrawer,
    toggleDraftType,
    toggleDraftStatus,
    toggleDraftManual,
    applyDrawerFilters,
    resetDrawer,
    setDraftTypes,
    setDraftStatuses,

    // Computed
    activeFilterCount,
    hasActiveFilters,
  };
}
