import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

// Detail fetch for the edit drawer. Pass "" to disable.
export function useBudgetDetail(id: string) {
  const trpc = useTRPC();
  const query = useQuery({
    ...trpc.payments.budgets.getById.queryOptions({ id }),
    enabled: !!id,
  });
  return { ...query, budget: query.data, isLoading: query.isPending && !!id };
}
