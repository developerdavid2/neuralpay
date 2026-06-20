import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useGetConnectedBanks() {
  const trpc = useTRPC();

  return useQuery(trpc.payments.plaid.getConnectedBanks.queryOptions());
}
