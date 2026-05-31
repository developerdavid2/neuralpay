import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useAccountAggregates() {
  const trpc = useTRPC();

  const {
    data: accountType,
    isPending,
    isError,
  } = useQuery(trpc.payments.accounts.aggregateByType.queryOptions());
}
