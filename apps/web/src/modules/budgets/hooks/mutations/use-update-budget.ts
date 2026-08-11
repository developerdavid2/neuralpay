import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";

export function useUpdateBudget() {
	const trpc = useTRPC();
	const { invalidateBudgets } = useInvalidateQueries();
	return useMutation({
		...trpc.payments.budgets.update.mutationOptions(),
		onSuccess: async () => {
			await invalidateBudgets();
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to update budget";
			console.error(message);
		},
	});
}
