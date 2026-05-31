"use client";

import { invalidateAccountsQueries } from "@/lib/invalidate-trpc-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAccountMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);

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
    [createAccount],
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
    [updateAccount],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setPendingDeleteId(id);
      try {
        await deleteAccount.mutateAsync({ id });
        toast.success("Account deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete account";
        toast.error(message);
        throw error;
      } finally {
        setPendingDeleteId(null);
      }
    },
    [deleteAccount],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    // Pending states
    isCreating: pendingCreate,
    isUpdating: pendingUpdateId !== null,
    isDeleting: pendingDeleteId !== null,
  };
}
