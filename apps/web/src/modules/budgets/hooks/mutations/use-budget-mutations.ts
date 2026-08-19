"use client";

import type { CreateBudgetInput, UpdateBudgetInput } from "@orra/types";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  useBudgetPendingSelectors,
  useBudgetPendingStore,
} from "../store/use-budget-pending";
import { useCreateBudget } from "./use-create-budget";
import { useDeleteBudget } from "./use-delete-budget";
import { useUpdateBudget } from "./use-update-budget";

export function useBudgetMutations() {
  const { markDeleting, unmarkDeleting, setPendingUpdateId, setPendingCreate } =
    useBudgetPendingStore();
  const pending = useBudgetPendingSelectors();

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const handleCreate = useCallback(
    async (values: CreateBudgetInput) => {
      setPendingCreate(true);
      try {
        const result = await createBudget.mutateAsync(values);
        toast.success("Budget created successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create budget";
        toast.error(message);
        throw error;
      } finally {
        setPendingCreate(false);
      }
    },
    [createBudget, setPendingCreate],
  );

  const handleUpdate = useCallback(
    async (values: UpdateBudgetInput) => {
      setPendingUpdateId(values.id);
      try {
        const result = await updateBudget.mutateAsync(values);
        toast.success("Budget updated successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update budget";
        toast.error(message);
        throw error;
      } finally {
        setPendingUpdateId(null);
      }
    },
    [updateBudget, setPendingUpdateId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      markDeleting([id]);
      try {
        await deleteBudget.mutateAsync({ id });
        toast.success("Budget deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete budget";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting([id]);
      }
    },
    [deleteBudget, markDeleting, unmarkDeleting],
  );

  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      markDeleting(ids);
      try {
        const results = await Promise.allSettled(
          ids.map((id) => deleteBudget.mutateAsync({ id })),
        );
        const failures = results.filter((r) => r.status === "rejected");
        const successes = results.filter((r) => r.status === "fulfilled");

        if (failures.length === 0) {
          toast.success(
            `${ids.length} budget${ids.length > 1 ? "s" : ""} deleted`,
          );
        } else if (successes.length > 0) {
          toast.warning(
            `${successes.length} of ${ids.length} budgets deleted. ${failures.length} failed.`,
          );
        } else {
          throw new Error("All deletions failed");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete budgets";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting(ids);
      }
    },
    [deleteBudget, markDeleting, unmarkDeleting],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    ...pending,
  };
}
