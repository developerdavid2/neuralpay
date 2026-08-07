"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useBudgetMonthlyStats(month: number, year: number) {
  const trpc = useTRPC();
  return useSuspenseQuery({
    ...trpc.payments.budgets.monthlyStats.queryOptions({ month, year }),
    staleTime: 60_000,
  });
}
