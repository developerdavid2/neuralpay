// hooks/accounts/use-account-mutations.ts
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  useAccountPendingSelectors,
  useAccountPendingStore,
} from "../store/use-account-pending";
import { useCreateAccount } from "./use-create-account";
import { useUpdateAccount } from "./use-update-account";
import { useDeleteAccount } from "./use-delete-account";

export function useAccountMutations() {
  const { markDeleting, unmarkDeleting, setPendingUpdateId, setPendingCreate } =
    useAccountPendingStore();
  const pending = useAccountPendingSelectors();

  const create = useCreateAccount();
  const update = useUpdateAccount();
  const deleteMut = useDeleteAccount();

  const handleCreate = useCallback(
    async (values: Parameters<typeof create.mutateAsync>[0]) => {
      setPendingCreate(true);
      try {
        return await create.mutateAsync(values);
      } finally {
        setPendingCreate(false);
      }
    },
    [create, setPendingCreate],
  );

  const handleUpdate = useCallback(
    async (values: Parameters<typeof update.mutateAsync>[0]) => {
      setPendingUpdateId(values.id);
      try {
        return await update.mutateAsync(values);
      } finally {
        setPendingUpdateId(null);
      }
    },
    [update, setPendingUpdateId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      markDeleting([id]);
      try {
        return await deleteMut.mutateAsync({ id });
      } finally {
        unmarkDeleting([id]);
      }
    },
    [deleteMut, markDeleting, unmarkDeleting],
  );

  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      markDeleting(ids);
      try {
        const results = await Promise.allSettled(
          ids.map((id) => deleteMut.mutateAsync({ id })),
        );
        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          toast.warning(`${failures.length} of ${ids.length} deletions failed`);
        }
        return results;
      } finally {
        unmarkDeleting(ids);
      }
    },
    [deleteMut, markDeleting, unmarkDeleting],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    ...pending,
  };
}
