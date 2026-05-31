import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useAccountDetail(bankAccountId: string) {
  const trpc = useTRPC();

  const {
    data: account,
    isPending,
    isError,
  } = useQuery({
    ...trpc.payments.accounts.getById.queryOptions({ id: bankAccountId }),
    enabled: !!bankAccountId,
    staleTime: 30_000,
  });

  return {
    account: account ?? null,
    isLoading: isPending,
    isError,
  };
}
