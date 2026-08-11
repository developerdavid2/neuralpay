"use client";

import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";

export function useDeleteManyBudgets() {
  const trpc = useTRPC();
  const { invalidateBudgets } = useInvalidateQueries();

  return useMutation({
    ...trpc.payments.budgets.deleteMany.mutationOptions(),
    onSuccess: async () => {
      await invalidateBudgets();
    },
  });
}
