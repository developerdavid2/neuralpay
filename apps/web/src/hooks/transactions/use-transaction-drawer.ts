import { create } from "zustand";

export type TransactionDrawerMode = "view" | "edit" | "add";

type TransactionDrawerState = {
  mode: TransactionDrawerMode;
  transactionId: string | null;
  isOpen: boolean;
  onOpenView: (id: string) => void;
  onOpenEdit: (id: string) => void;
  onOpenAdd: () => void;
  onClose: () => void;
};

export const useTransactionDrawer = create<TransactionDrawerState>((set) => ({
  mode: "view",
  transactionId: null,
  isOpen: false,
  onOpenView: (id) => set({ mode: "view", transactionId: id, isOpen: true }),
  onOpenEdit: (id) => set({ mode: "edit", transactionId: id, isOpen: true }),
  onOpenAdd: () => set({ mode: "add", transactionId: null, isOpen: true }),
  onClose: () => set({ isOpen: false, transactionId: null, mode: "view" }),
}));
