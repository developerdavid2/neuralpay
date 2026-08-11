import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";

export function useCreateBudget() {
	const trpc = useTRPC();
	const { invalidateBudgets } = useInvalidateQueries();
	return useMutation({
		...trpc.payments.budgets.create.mutationOptions(),
		onSuccess: async () => {
			await invalidateBudgets();
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to create budget";
			console.error(message);
		},
	});
}
