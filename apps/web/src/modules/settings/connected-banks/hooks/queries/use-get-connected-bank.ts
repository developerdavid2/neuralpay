import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useGetConnectedBank() {
  const trpc = useTRPC();

  return useQuery(trpc.payments.plaid.getConnectedBank.queryOptions());
}
