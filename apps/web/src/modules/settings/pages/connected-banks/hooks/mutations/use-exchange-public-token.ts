import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useExchangePublicToken() {
  const trpc = useTRPC();
  const { invalidatePayments } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.plaid.exchangePublicToken.mutationOptions(),

    onSuccess: async () => {
      await invalidatePayments();
      toast.success("Bank connected successfully");
    },

    onError: () => {
      toast.error("Failed to connect bank");
    },
  });
}
