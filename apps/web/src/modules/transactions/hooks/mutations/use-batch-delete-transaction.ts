import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useBatchDeleteTransaction() {
  const trpc = useTRPC();
  const { invalidateTransactions } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.transactions.batchDelete.mutationOptions(),
    onSuccess: async () => {
      await invalidateTransactions();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to update account";
      console.error(message);
    },
  });
}
