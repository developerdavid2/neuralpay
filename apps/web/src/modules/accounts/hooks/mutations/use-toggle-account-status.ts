import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleAccountStatus() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutationFn } = trpc.payments.accounts.toggleStatus.mutationOptions();

  return useMutation({
    mutationFn,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({
        predicate: (q) => {
          const path = q.queryKey[0] as string[];
          return Array.isArray(path) && path[0] === "payments";
        },
      });

      const snapshot = queryClient.getQueriesData({
        predicate: (q) => {
          const path = q.queryKey[0] as string[];
          return Array.isArray(path) && path[0] === "payments";
        },
      });

      queryClient.setQueriesData(
        {
          predicate: (q) => {
            const path = q.queryKey[0] as string[];
            return Array.isArray(path) && path[0] === "payments";
          },
        },
        (old: unknown) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map((acc: { id: string; status: string }) =>
              acc.id === id ? { ...acc, status } : acc,
            );
          }

          if (
            typeof old === "object" &&
            old !== null &&
            "items" in old &&
            Array.isArray((old as { items: unknown[] }).items)
          ) {
            return {
              ...(old as object),
              items: (
                old as { items: { id: string; status: string }[] }
              ).items.map((acc) => (acc.id === id ? { ...acc, status } : acc)),
            };
          }

          if (
            typeof old === "object" &&
            old !== null &&
            "id" in old &&
            (old as { id: string }).id === id
          ) {
            return { ...(old as object), status };
          }

          return old;
        },
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        for (const [queryKey, data] of context.snapshot) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

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
