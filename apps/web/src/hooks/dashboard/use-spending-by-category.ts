import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSpendingByCategory() {
  const trpc = useTRPC();
  const now = new Date();
  const { data: spendingCategory } = useSuspenseQuery(
    trpc.payments.transactions.spendingByCategory.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  );

  return { spendingCategory };
}
