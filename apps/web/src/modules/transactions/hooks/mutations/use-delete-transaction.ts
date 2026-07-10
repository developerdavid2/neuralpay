import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useDeleteTransaction() {
  const trpc = useTRPC();
  const { invalidateTransactions } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.transactions.delete.mutationOptions(),
    onSuccess: async () => {
      await invalidateTransactions();
    },

    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete transaction";
      console.error(message);
    },
  });
}
