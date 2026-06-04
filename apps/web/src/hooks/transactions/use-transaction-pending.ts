import { create } from "zustand";

type TransactionPendingState = {
  pendingDeleteIds: Set<string>;
  pendingUpdateId: string | null;
  pendingCreate: boolean;
  markDeleting: (ids: string[]) => void;
  unmarkDeleting: (ids: string[]) => void;
  setPendingUpdateId: (id: string | null) => void;
  setPendingCreate: (value: boolean) => void;
};

export const useTransactionPendingStore = create<TransactionPendingState>(
  (set) => ({
    pendingDeleteIds: new Set(),
    pendingUpdateId: null,
    pendingCreate: false,
    markDeleting: (ids) =>
      set((state) => {
        const pendingDeleteIds = new Set(state.pendingDeleteIds);
        ids.forEach((id) => pendingDeleteIds.add(id));
        return { pendingDeleteIds };
      }),
    unmarkDeleting: (ids) =>
      set((state) => {
        const pendingDeleteIds = new Set(state.pendingDeleteIds);
        ids.forEach((id) => pendingDeleteIds.delete(id));
        return { pendingDeleteIds };
      }),
    setPendingUpdateId: (id) => set({ pendingUpdateId: id }),
    setPendingCreate: (value) => set({ pendingCreate: value }),
  }),
);

export function useTransactionPendingSelectors() {
  const pendingDeleteIds = useTransactionPendingStore((s) => s.pendingDeleteIds);
  const pendingUpdateId = useTransactionPendingStore((s) => s.pendingUpdateId);
  const pendingCreate = useTransactionPendingStore((s) => s.pendingCreate);

  const isDeleting = (id: string) => pendingDeleteIds.has(id);
  const isRowPending = (id: string) => pendingDeleteIds.has(id);
  const isBatchDeleting = pendingDeleteIds.size > 1;

  return {
    pendingDeleteIds,
    pendingUpdateId,
    pendingCreate,
    isDeleting,
    isRowPending,
    isBatchDeleting,
    isCreating: pendingCreate,
    isUpdating: pendingUpdateId !== null,
  };
}
