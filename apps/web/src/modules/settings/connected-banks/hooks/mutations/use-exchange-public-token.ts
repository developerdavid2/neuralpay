import { invalidateAllPaymentQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useExchangePublicToken() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.exchangePublicToken.mutationOptions(),
    onSuccess: async () => {
      toast.success("Bank connected successfully");
      await invalidateAllPaymentQueries(queryClient);
    },
    onError: () => {
      toast.error("Failed to connect bank");
    },
  });
}
