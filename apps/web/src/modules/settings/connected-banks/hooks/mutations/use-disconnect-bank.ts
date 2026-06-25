import { invalidateAllPaymentQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDisconnectBank() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.disconnectBankById.mutationOptions(),
    onSuccess: async () => {
      toast.success("Bank disconnected successfully");
      await invalidateAllPaymentQueries(queryClient);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect bank",
      );
    },
  });
}
