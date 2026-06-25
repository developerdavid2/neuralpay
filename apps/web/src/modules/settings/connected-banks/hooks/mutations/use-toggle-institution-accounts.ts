import {
  invalidateAccountsQueries,
  invalidateTRPCQueries,
} from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleInstitutionAccounts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.payments.plaid.toggleInstitutionAccounts.mutationOptions(),
    onSettled: async () => {
      await Promise.all([
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "listAll"]),
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "getById"]),
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "list"]),
        invalidateTRPCQueries(queryClient, [
          "payments",
          "accounts",
          "aggregateByType",
        ]),
      ]);
    },
  });
}
