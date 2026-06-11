"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";

export function useQueryParam(key: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getFromUrl = useCallback(() => {
    return searchParams.get(key) ?? "";
  }, [searchParams, key]);

  const [currentValue, setCurrentValue] = useState<string>(() => getFromUrl());

  useEffect(() => {
    setCurrentValue(getFromUrl());
  }, [getFromUrl]);

  const setValue = useCallback(
    (value: string | null, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (options?.resetPage !== false) {
        params.delete("page");
      }

      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const query = params.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;

      router.replace(newUrl as Route, { scroll: false });
      setCurrentValue(value ?? "");
    },
    [key, searchParams, pathname, router],
  );

  return { currentValue, setValue };
}
