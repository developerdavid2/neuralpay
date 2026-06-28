"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  useTransactionPendingSelectors,
  useTransactionPendingStore,
} from "../store/use-transaction-pending";
import { useBatchDeleteTransaction } from "./use-batch-delete-transaction";
import { useCreateTransaction } from "./use-create-transaction";
import { useDeleteTransaction } from "./use-delete-transaction";
import { useUpdateTransaction } from "./use-update-transaction";

export function useTransactionMutations() {
  const { markDeleting, unmarkDeleting, setPendingUpdateId, setPendingCreate } =
    useTransactionPendingStore();
  const pending = useTransactionPendingSelectors();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const batchDeleteTx = useBatchDeleteTransaction();

  const handleCreate = useCallback(
    async (values: Parameters<typeof createTx.mutateAsync>[0]) => {
      setPendingCreate(true);
      try {
        const result = await createTx.mutateAsync(values);
        toast.success("Transaction created successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create transaction";
        toast.error(message);
        throw error;
      } finally {
        setPendingCreate(false);
      }
    },
    [createTx, setPendingCreate],
  );

  const handleUpdate = useCallback(
    async (values: Parameters<typeof updateTx.mutateAsync>[0]) => {
      setPendingUpdateId(values.id);
      try {
        const result = await updateTx.mutateAsync(values);
        toast.success("Transaction updated successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update transaction";
        toast.error(message);
        throw error;
      } finally {
        setPendingUpdateId(null);
      }
    },
    [updateTx, setPendingUpdateId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      markDeleting([id]);
      try {
        await deleteTx.mutateAsync({ id });
        toast.success("Transaction deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete transaction";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting([id]);
      }
    },
    [deleteTx, markDeleting, unmarkDeleting],
  );

  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      markDeleting(ids);
      try {
        await batchDeleteTx.mutateAsync({ ids });
        toast.success(
          `${ids.length} transaction${ids.length > 1 ? "s" : ""} deleted`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete transactions";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting(ids);
      }
    },
    [batchDeleteTx, markDeleting, unmarkDeleting],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    ...pending,
  };
}
