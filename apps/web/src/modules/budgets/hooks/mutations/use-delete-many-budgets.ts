"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useDeleteManyBudgets() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	return useMutation({
		...trpc.payments.budgets.deleteMany.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.payments.budgets.list.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.payments.budgets.monthlyStats.queryKey(),
			});
		},
	});
}
