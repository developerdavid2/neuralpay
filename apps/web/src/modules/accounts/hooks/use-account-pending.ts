import { create } from "zustand";

type AccountPendingState = {
  pendingDeleteIds: Set<string>;
  pendingDisconnectIds: Set<string>;
  pendingUpdateId: string | null;
  pendingCreate: boolean;
  markDeleting: (ids: string[]) => void;
  unmarkDeleting: (ids: string[]) => void;
  markDisconnecting: (ids: string[]) => void;
  unmarkDisconnecting: (ids: string[]) => void;
  setPendingUpdateId: (id: string | null) => void;
  setPendingCreate: (value: boolean) => void;
};

export const useAccountPendingStore = create<AccountPendingState>((set) => ({
  pendingDeleteIds: new Set(),
  pendingDisconnectIds: new Set(),
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
  markDisconnecting: (ids) =>
    set((state) => {
      const pendingDisconnectIds = new Set(state.pendingDisconnectIds);
      ids.forEach((id) => pendingDisconnectIds.add(id));
      return { pendingDisconnectIds };
    }),
  unmarkDisconnecting: (ids) =>
    set((state) => {
      const pendingDisconnectIds = new Set(state.pendingDisconnectIds);
      ids.forEach((id) => pendingDisconnectIds.delete(id));
      return { pendingDisconnectIds };
    }),
  setPendingUpdateId: (id) => set({ pendingUpdateId: id }),
  setPendingCreate: (value) => set({ pendingCreate: value }),
}));

export function useAccountPendingSelectors() {
  const pendingDeleteIds = useAccountPendingStore((s) => s.pendingDeleteIds);
  const pendingDisconnectIds = useAccountPendingStore(
    (s) => s.pendingDisconnectIds,
  );
  const pendingUpdateId = useAccountPendingStore((s) => s.pendingUpdateId);
  const pendingCreate = useAccountPendingStore((s) => s.pendingCreate);

  const isDeleting = (id: string) => pendingDeleteIds.has(id);
  const isDisconnecting = (id: string) => pendingDisconnectIds.has(id);
  const isRowPending = (id: string) =>
    pendingDeleteIds.has(id) || pendingDisconnectIds.has(id);
  const isBatchDeleting = pendingDeleteIds.size > 1;

  return {
    pendingDeleteIds,
    pendingDisconnectIds,
    pendingUpdateId,
    pendingCreate,
    isDeleting,
    isDisconnecting,
    isRowPending,
    isBatchDeleting,
    isCreating: pendingCreate,
    isUpdating: pendingUpdateId !== null,
  };
}
