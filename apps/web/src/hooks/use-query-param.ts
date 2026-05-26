import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Route } from "next";

export function useQueryParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setValue = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [key, pathname, router, searchParams],
  );

  const currentValue = searchParams.get(key) ?? "";

  return { currentValue, setValue };
}
