"use client";

import { invalidateAccountsQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  useAccountPendingSelectors,
  useAccountPendingStore,
} from "../../store/use-account-pending";

export function useAccountMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    markDeleting,
    unmarkDeleting,
    markDisconnecting,
    unmarkDisconnecting,
    setPendingUpdateId,
    setPendingCreate,
  } = useAccountPendingStore();
  const pending = useAccountPendingSelectors();

  const createAccount = useMutation({
    ...trpc.payments.accounts.create.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccountsQueries(queryClient);
    },
  });

  const updateAccount = useMutation({
    ...trpc.payments.accounts.update.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccountsQueries(queryClient);
    },
  });

  const deleteAccount = useMutation({
    ...trpc.payments.accounts.delete.mutationOptions(),
    onSuccess: async () => {
      await invalidateAccountsQueries(queryClient);
    },
  });

  const handleCreate = useCallback(
    async (values: Parameters<typeof createAccount.mutateAsync>[0]) => {
      setPendingCreate(true);
      try {
        const result = await createAccount.mutateAsync(values);
        toast.success("Account created successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create account";
        toast.error(message);
        throw error;
      } finally {
        setPendingCreate(false);
      }
    },
    [createAccount, setPendingCreate],
  );

  const handleUpdate = useCallback(
    async (values: Parameters<typeof updateAccount.mutateAsync>[0]) => {
      setPendingUpdateId(values.id);
      try {
        const result = await updateAccount.mutateAsync(values);
        toast.success("Account updated successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update account";
        toast.error(message);
        throw error;
      } finally {
        setPendingUpdateId(null);
      }
    },
    [updateAccount, setPendingUpdateId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      markDeleting([id]);
      try {
        await deleteAccount.mutateAsync({ id });
        toast.success("Account deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete account";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting([id]);
      }
    },
    [deleteAccount, markDeleting, unmarkDeleting],
  );

  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      markDeleting(ids);
      try {
        const results = await Promise.allSettled(
          ids.map((id) => deleteAccount.mutateAsync({ id })),
        );
        const failures = results.filter((r) => r.status === "rejected");
        const successes = results.filter((r) => r.status === "fulfilled");

        if (failures.length === 0) {
          toast.success(
            `${ids.length} account${ids.length > 1 ? "s" : ""} deleted`,
          );
        } else if (successes.length > 0) {
          toast.warning(
            `${successes.length} of ${ids.length} accounts deleted. ${failures.length} failed.`,
          );
        } else {
          throw new Error("All deletions failed");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete accounts";
        toast.error(message);
        throw error;
      } finally {
        unmarkDeleting(ids);
      }
    },
    [deleteAccount, markDeleting, unmarkDeleting],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    ...pending,
  };
}
