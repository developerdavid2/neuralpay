import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useMonthlyTopCategories(params?: {
  month?: number;
  year?: number;
  limit?: number;
}) {
  const trpc = useTRPC();
  const now = new Date();

  return useSuspenseQuery(
    trpc.payments.transactions.topCategories.queryOptions({
      month: params?.month ?? now.getMonth() + 1,
      year: params?.year ?? now.getFullYear(),
      limit: params?.limit ?? 5,
    }),
  );
}
