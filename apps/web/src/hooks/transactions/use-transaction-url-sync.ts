import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { TransactionDrawerMode } from "./use-transaction-drawer";

export function useTransactionUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const syncToUrl = useCallback(
    (mode: TransactionDrawerMode, txId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (txId) {
        params.set("mode", mode);
        params.set("focus", txId);
      } else {
        params.delete("focus");
        params.delete("mode");
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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    params.delete("mode");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  return { syncToUrl, clearUrl };
}
