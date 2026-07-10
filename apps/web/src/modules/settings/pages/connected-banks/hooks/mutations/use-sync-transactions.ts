import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSyncTransactions() {
  const trpc = useTRPC();
  const { invalidatePayments } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.plaid.syncTransactionsById.mutationOptions(),

    onSuccess: async (data) => {
      await invalidatePayments();
      toast.success(`${data.added} transactions synced`);
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync transactions",
      );
    },
  });
}
