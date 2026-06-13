"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useAccountUrlSync() {
  const searchParams = useSearchParams();

  const setUrl = useCallback(
    (mode: string, accountId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "add") {
        params.set("mode", "add");
        params.delete("account");
      } else if (accountId) {
        params.set("mode", mode);
        params.set("account", accountId);
      }
      params.delete("focus");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname,
      );
    },
    [searchParams],
  );

  const clearUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("account");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [searchParams]);

  return { setUrl, clearUrl };
}
