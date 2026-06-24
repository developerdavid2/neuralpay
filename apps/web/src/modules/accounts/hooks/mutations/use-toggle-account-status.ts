import { useTRPC } from "@/trpc/trpc-client";
import { invalidateTRPCQueries } from "@/lib/invalidate-trpc-queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleAccountStatus() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutationFn } = trpc.payments.accounts.toggleStatus.mutationOptions();

  const predicate = (q: { queryKey: readonly unknown[] }) => {
    const path = q.queryKey[0];
    return (
      Array.isArray(path) && path[0] === "payments" && path[1] === "accounts"
    );
  };

  return useMutation({
    mutationFn,

    onMutate: async ({ id, status }) => {
      // ← No cancelQueries here — it was cancelling institution toggle refetches

      const snapshot = queryClient.getQueriesData({ predicate });

      queryClient.setQueriesData({ predicate }, (old: unknown) => {
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
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        for (const [queryKey, data] of context.snapshot) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: async () => {
      // Narrow scope — only what this mutation actually changed
      await Promise.all([
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "listAll"]),
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "getById"]),
        invalidateTRPCQueries(queryClient, ["payments", "accounts", "list"]),
      ]);
    },
  });
}
