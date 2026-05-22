import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Route } from "next";
import type { Insight } from "@/modules/insights/types";

/**
 * Manages drawer state and URL synchronization for insights
 * Handles: opening/closing drawer, URL focus param, auto-opening on mount
 */
export function useInsightDrawerManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Open drawer and sync URL with focus param
  const openDrawer = useCallback(
    (insightId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("focus", insightId);
      router.replace((pathname + "?" + params.toString()) as Route, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Close drawer and remove focus param from URL
  const closeDrawer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  // Get focused insight ID from URL
  const getFocusedId = useCallback(() => {
    return searchParams.get("focus");
  }, [searchParams]);

  return {
    openDrawer,
    closeDrawer,
    getFocusedId,
  };
}
