"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";
import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import type { CreateBudgetInput, UpdateBudgetInput } from "@neuralpay/types";

export function useBudgetMutations() {
  const trpc = useTRPC();
  const { invalidateBudgets } = useInvalidateQueries();

  const createBudget = useMutation(
    trpc.payments.budgets.create.mutationOptions(),
  );
  const updateBudget = useMutation(
    trpc.payments.budgets.update.mutationOptions(),
  );
  const deleteBudget = useMutation(
    trpc.payments.budgets.delete.mutationOptions(),
  );

  const handleCreate = useCallback(
    async (values: CreateBudgetInput) => {
      try {
        const result = await createBudget.mutateAsync(values);
        await invalidateBudgets();
        toast.success("Budget created");
        return result;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create budget",
        );
        throw error;
      }
    },
    [createBudget, invalidateBudgets],
  );

  const handleUpdate = useCallback(
    async (values: UpdateBudgetInput) => {
      try {
        const result = await updateBudget.mutateAsync(values);
        await invalidateBudgets();
        toast.success("Budget updated");
        return result;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update budget",
        );
        throw error;
      }
    },
    [updateBudget, invalidateBudgets],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteBudget.mutateAsync({ id });
        await invalidateBudgets();
        toast.success("Budget deleted");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete budget",
        );
        throw error;
      }
    },
    [deleteBudget, invalidateBudgets],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending,
  };
}
