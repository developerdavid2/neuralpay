import { useTRPC } from "@/trpc/trpc-client";
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleAccountStatus() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { invalidateAccounts } = useInvalidateQueries();

  const { mutationFn } = trpc.payments.accounts.toggleStatus.mutationOptions();

  const accountsFilter = trpc.payments.accounts.pathFilter();

  return useMutation({
    mutationFn,

    onMutate: async ({ id, status }) => {
      const snapshot = queryClient.getQueriesData(accountsFilter);

      queryClient.setQueriesData(accountsFilter, (old: unknown) => {
        if (!old) return old;

        // Array response
        if (Array.isArray(old)) {
          return old.map((acc: any) =>
            acc.id === id ? { ...acc, status } : acc,
          );
        }

        // Paginated response
        if (
          typeof old === "object" &&
          old !== null &&
          "items" in old &&
          Array.isArray((old as any).items)
        ) {
          return {
            ...(old as any),
            items: (old as any).items.map((acc: any) =>
              acc.id === id ? { ...acc, status } : acc,
            ),
          };
        }

        // Single account response
        if (
          typeof old === "object" &&
          old !== null &&
          "id" in old &&
          (old as any).id === id
        ) {
          return {
            ...(old as any),
            status,
          };
        }

        return old;
      });

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      context?.snapshot?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: async () => {
      await invalidateAccounts();
    },
  });
}
