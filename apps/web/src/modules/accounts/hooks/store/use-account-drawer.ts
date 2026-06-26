"use client";
import type { BankAccount } from "@neuralpay/types";
import { create } from "zustand";

export type AccountDrawerMode = "view" | "edit" | "add";

type AccountDrawerState = {
  mode: AccountDrawerMode;
  accountId: string | null;
  accountData: BankAccount | null;
  isOpen: boolean;
  onOpenView: (id: string, data?: BankAccount) => void;
  onOpenEdit: (id: string, data?: BankAccount) => void;
  onOpenAdd: () => void;
  onClose: () => void;
};

export const useAccountDrawer = create<AccountDrawerState>((set) => ({
  mode: "view",
  accountId: null,
  accountData: null,
  isOpen: false,
  onOpenView: (id, data) =>
    set({
      mode: "view",
      accountId: id,
      accountData: data ?? null,
      isOpen: true,
    }),
  onOpenEdit: (id, data) =>
    set({
      mode: "edit",
      accountId: id,
      accountData: data ?? null,
      isOpen: true,
    }),
  onOpenAdd: () =>
    set({ mode: "add", accountId: null, accountData: null, isOpen: true }),
  onClose: () =>
    set({ isOpen: false, accountId: null, accountData: null, mode: "view" }),
}));
