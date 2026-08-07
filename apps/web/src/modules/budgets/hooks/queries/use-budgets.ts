import type { BudgetsListInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useBudgetsList(input: BudgetsListInput) {
	const trpc = useTRPC();

	const query = useSuspenseInfiniteQuery({
		...trpc.payments.budgets.list.infiniteQueryOptions(input, {
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		}),
	});

	return {
		...query,
		isLoading: query.isPending,
	};
}
