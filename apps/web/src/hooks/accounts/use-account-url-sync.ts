// hooks/accounts/use-account-url-sync.ts
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Route } from "next";

export function useAccountUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
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
      params.delete("mode");
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
