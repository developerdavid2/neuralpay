import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useCreateTransaction() {
  const trpc = useTRPC();
  const { invalidateTransactions } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.transactions.create.mutationOptions(),
    onSuccess: async () => {
      await invalidateTransactions();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to create transaction";
      console.error(message);
    },
  });
}
