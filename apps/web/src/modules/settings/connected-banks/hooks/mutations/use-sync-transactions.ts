import { invalidateAllPaymentQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSyncTransactions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.syncTransactionsById.mutationOptions(),
    onSuccess: async (data) => {
      toast.success(`${data.added} transactions synced`);
      await invalidateAllPaymentQueries(queryClient);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync transactions",
      );
    },
  });
}
