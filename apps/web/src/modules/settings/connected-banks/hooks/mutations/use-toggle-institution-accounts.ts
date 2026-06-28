import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useToggleInstitutionAccounts() {
  const trpc = useTRPC();
  const { invalidateAccounts } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.plaid.toggleInstitutionAccounts.mutationOptions(),
    onSettled: async () => await invalidateAccounts(),
  });
}
