import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDisconnectBank() {
  const trpc = useTRPC();
  const { invalidatePayments } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.plaid.disconnectBankById.mutationOptions(),

    onSuccess: async () => {
      await invalidatePayments();
      toast.success("Bank disconnected successfully");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect bank",
      );
    },
  });
}
