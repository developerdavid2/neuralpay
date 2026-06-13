import { useCallback } from "react";
import type { TransactionDrawerMode } from "../store/use-transaction-drawer";

export function useTransactionUrlSync() {
  const syncToUrl = useCallback(
    (mode: TransactionDrawerMode, txId: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (mode === "add") {
        params.set("mode", "add");
        params.delete("focus");
      } else if (txId) {
        params.set("mode", mode);
        params.set("focus", txId);
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
