// hooks/accounts/use-account-drawer.ts
import { create } from "zustand";

export type AccountDrawerMode = "view" | "edit" | "add";

type AccountDrawerState = {
  mode: AccountDrawerMode;
  accountId: string | null;
  isOpen: boolean;
  onOpenView: (id: string) => void;
  onOpenEdit: (id: string) => void;
  onOpenAdd: () => void;
  onClose: () => void;
};

export const useAccountDrawer = create<AccountDrawerState>((set) => ({
  mode: "view",
  accountId: null,
  isOpen: false,
  onOpenView: (id) => set({ mode: "view", accountId: id, isOpen: true }),
  onOpenEdit: (id) => set({ mode: "edit", accountId: id, isOpen: true }),
  onOpenAdd: () => set({ mode: "add", accountId: null, isOpen: true }),
  onClose: () => set({ isOpen: false, accountId: null, mode: "view" }),
}));
