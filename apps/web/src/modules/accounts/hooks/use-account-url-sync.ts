"use client";

import { useCallback } from "react";
import type { AccountDrawerMode } from "./store/use-account-drawer";

export function useAccountUrlSync() {
  const setUrl = useCallback(
    (mode: AccountDrawerMode, accountId: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (mode === "add") {
        params.set("mode", "add");
        params.delete("focusAccountId");
      } else if (accountId) {
        params.set("mode", mode);
        params.set("focusAccountId", accountId);
      }
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname,
      );
    },
    [],
  );

  const clearUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);

    params.delete("mode");
    params.delete("focusAccountId");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  return { setUrl, clearUrl };
}
