// use-query-param.ts — full replacement:
"use client";

import { useCallback, useEffect, useState } from "react";

export function useQueryParam(key: string) {
  const getFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) ?? "";
  };

  const [currentValue, setCurrentValue] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getFromUrl();
  });

  // Sync when URL changes externally (e.g. back/forward)
  useEffect(() => {
    const handler = () => setCurrentValue(getFromUrl());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [key]);

  const setValue = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      const newUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;

      window.history.pushState({}, "", newUrl);
      setCurrentValue(value ?? ""); // update local state immediately
    },
    [key],
  );

  return { currentValue, setValue };
}
