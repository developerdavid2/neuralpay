"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Transaction } from "@/modules/transactions/types";
import {
  invalidateTransactionQueries,
  invalidateTRPCQueries,
} from "@/lib/invalidate-trpc-queries";

export function useTransactionMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingExcludeId, setPendingExcludeId] = useState<string | null>(null);
  const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);

  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add">("view");

  const createTx = useMutation({
    ...trpc.payments.transactions.create.mutationOptions(),
    onSuccess: () => {
      invalidateTransactionQueries(queryClient);
    },
  });

  const updateTx = useMutation({
    ...trpc.payments.transactions.update.mutationOptions(),
    onSuccess: () => {
      invalidateTransactionQueries(queryClient);
    },
  });

  const deleteTx = useMutation({
    ...trpc.payments.transactions.delete.mutationOptions(),
    onSuccess: () => {
      invalidateTransactionQueries(queryClient);
    },
  });

  const batchDelete = useMutation({
    ...trpc.payments.transactions.batchDelete.mutationOptions(),
    onSuccess: () => {
      invalidateTransactionQueries(queryClient);
    },
  });

  const handleCreate = useCallback(
    async (values: Parameters<typeof createTx.mutateAsync>[0]) => {
      setPendingCreate(true);
      try {
        const result = await createTx.mutateAsync(values);
        setDrawerOpen(false);
        return result;
      } finally {
        setPendingCreate(false);
      }
    },
    [createTx],
  );

  const handleUpdate = useCallback(
    async (values: Parameters<typeof updateTx.mutateAsync>[0]) => {
      setPendingUpdateId(values.id);
      try {
        const result = await updateTx.mutateAsync(values);
        setDrawerOpen(false);
        return result;
      } finally {
        setPendingUpdateId(null);
      }
    },
    [updateTx],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setPendingDeleteId(id);
      try {
        await deleteTx.mutateAsync({ id });
        setDrawerOpen(false);
        setSelectedTransactionId(null);
      } finally {
        setPendingDeleteId(null);
      }
    },
    [deleteTx],
  );

  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      await batchDelete.mutateAsync({ ids });
    },
    [batchDelete],
  );

  // "Exclude" is a soft-delete / hide from analysis for synced transactions
  const handleExclude = useCallback(
    async (id: string) => {
      setPendingExcludeId(id);
      try {
        // This calls a dedicated exclude endpoint or updates with excludedAt
        await updateTx.mutateAsync({ id, excludedFromAnalysis: true } as any);
        setDrawerOpen(false);
      } finally {
        setPendingExcludeId(null);
      }
    },
    [updateTx],
  );

  const openView = useCallback((tx: Transaction) => {
    setSelectedTransactionId(tx.id);
    setDrawerMode("view");
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((tx: Transaction) => {
    setSelectedTransactionId(tx.id);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const openAdd = useCallback(() => {
    setSelectedTransactionId(null);
    setDrawerMode("add");
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Delay clearing selection so exit animation completes
    setTimeout(() => setSelectedTransactionId(null), 300);
  }, []);

  // ─── Pending State Checkers ────────────────────────────────────────────────

  const isDeleting = useCallback(
    (id: string) => pendingDeleteId === id,
    [pendingDeleteId],
  );

  const isExcluding = useCallback(
    (id: string) => pendingExcludeId === id,
    [pendingExcludeId],
  );

  const isUpdating = useCallback(
    (id: string) => pendingUpdateId === id,
    [pendingUpdateId],
  );

  return {
    // Mutations
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    handleExclude,
    // Drawer state
    selectedTransactionId,
    drawerOpen,
    drawerMode,
    setDrawerOpen,
    openView,
    openEdit,
    openAdd,
    closeDrawer,
    // Pending states
    isDeleting,
    isExcluding,
    isUpdating,
    isCreating: pendingCreate,
  };
}
