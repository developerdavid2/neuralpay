import type { Transaction } from "@neuralpay/types";
import { create } from "zustand";

export type TransactionDrawerMode = "view" | "edit" | "add";

interface TransactionDrawerState {
  isOpen: boolean;
  mode: TransactionDrawerMode;
  transactionId: string | null;
  transactionData: Transaction | null;
  onOpenView: (id: string, data?: Transaction) => void;
  onOpenEdit: (id: string, data?: Transaction) => void;
  onOpenAdd: () => void;
  onClose: () => void;
}

export const useTransactionDrawer = create<TransactionDrawerState>((set) => ({
  isOpen: false,
  mode: "view",
  transactionId: null,
  transactionData: null,
  onOpenView: (id, data) =>
    set({
      isOpen: true,
      mode: "view",
      transactionId: id,
      transactionData: data ?? null,
    }),
  onOpenEdit: (id, data) =>
    set({
      isOpen: true,
      mode: "edit",
      transactionId: id,
      transactionData: data ?? null,
    }),
  onOpenAdd: () =>
    set({
      isOpen: true,
      mode: "add",
      transactionId: null,
      transactionData: null,
    }),
  onClose: () =>
    set({
      isOpen: false,
      transactionId: null,
      transactionData: null,
    }),
}));
