// modules/budgets/hooks/use-budget-url-sync.ts
"use client";

import { useCallback } from "react";
import type { BudgetDrawerMode } from "./store/use-budget-drawer";

export function useBudgetUrlSync() {
  const setUrl = useCallback(
    (mode: BudgetDrawerMode, budgetId: string | null) => {
      const params = new URLSearchParams(window.location.search);
      console.log("setUrl called", {
        mode,
        budgetId,
        currentSearch: window.location.search,
      });

      if (mode === "add") {
        params.set("mode", "add");
        params.delete("focusBudgetId");
      } else if (budgetId) {
        params.set("mode", mode);
        params.set("focusBudgetId", budgetId);
      }

      const query = params.toString();
      console.log("new query", query);

      window.history.replaceState(
        null,
        "",
        query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname,
      );

      console.log("URL after replaceState", window.location.search);
    },
    [],
  );

  const clearUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("focusBudgetId");
    params.delete("mode");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  return { setUrl, clearUrl };
}
