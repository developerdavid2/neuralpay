import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useCurrentMonthSpending() {
  const trpc = useTRPC();

  return useSuspenseQuery({
    ...trpc.payments.transactions.currentMonthSpending.queryOptions(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
