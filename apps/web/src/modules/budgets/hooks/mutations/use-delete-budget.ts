import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";

export function useDeleteBudget() {
	const trpc = useTRPC();
	const { invalidateBudgets } = useInvalidateQueries();
	return useMutation({
		...trpc.payments.budgets.delete.mutationOptions(),
		onSuccess: async () => {
			await invalidateBudgets();
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to delete budget";
			console.error(message);
		},
	});
}
