import { skipToken, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useBudgetDetail(id?: string) {
	const trpc = useTRPC();
	const {
		data: budget,
		isPending,
		isError,
	} = useQuery(
		trpc.payments.budgets.getById.queryOptions(id ? { id } : skipToken),
	);

	return {
		budget,
		isLoading: isPending,
		isError,
	};
}
