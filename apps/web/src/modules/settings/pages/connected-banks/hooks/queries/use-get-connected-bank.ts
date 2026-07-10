import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useGetConnectedBanks() {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.payments.plaid.getConnectedBanks.queryOptions());
}
