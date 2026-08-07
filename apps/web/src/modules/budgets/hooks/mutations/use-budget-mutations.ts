"use client";

import type { CreateBudgetInput, UpdateBudgetInput } from "@neuralpay/types";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCreateBudget } from "./use-create-budget";
import { useDeleteBudget } from "./use-delete-budget";
import { useUpdateBudget } from "./use-update-budget";

export function useBudgetMutations() {
	const createBudget = useCreateBudget();
	const updateBudget = useUpdateBudget();
	const deleteBudget = useDeleteBudget();

	const handleCreate = useCallback(
		async (values: CreateBudgetInput) => {
			try {
				const result = await createBudget.mutateAsync(values);
				toast.success("Budget created");
				return result;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create budget",
				);
				throw error;
			}
		},
		[createBudget],
	);

	const handleUpdate = useCallback(
		async (values: UpdateBudgetInput) => {
			try {
				const result = await updateBudget.mutateAsync(values);
				toast.success("Budget updated");
				return result;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update budget",
				);
				throw error;
			}
		},
		[updateBudget],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteBudget.mutateAsync({ id });
				toast.success("Budget deleted");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to delete budget",
				);
				throw error;
			}
		},
		[deleteBudget],
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
