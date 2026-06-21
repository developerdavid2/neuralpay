import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleInstitutionAccounts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.toggleInstitutionAccounts.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const path = q.queryKey[0] as string[];
          return Array.isArray(path) && path[0] === "payments";
        },
      });
    },
  });
}
