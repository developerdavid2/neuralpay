"use client";
import type { Budget } from "@neuralpay/types";
import { create } from "zustand";

export type BudgetDrawerMode = "view" | "edit" | "add";

type BudgetDrawerState = {
  mode: BudgetDrawerMode;
  budgetId: string | null;
  budgetData: Budget | null;
  isOpen: boolean;
  onOpenView: (id: string, data?: Budget) => void;
  onOpenEdit: (id: string, data?: Budget) => void;
  onOpenAdd: () => void;
  onClose: () => void;
};

export const useBudgetDrawer = create<BudgetDrawerState>((set) => ({
  mode: "view",
  budgetId: null,
  budgetData: null,
  isOpen: false,
  onOpenView: (id, data) =>
    set({ mode: "view", budgetId: id, budgetData: data ?? null, isOpen: true }),
  onOpenEdit: (id, data) =>
    set({ mode: "edit", budgetId: id, budgetData: data ?? null, isOpen: true }),
  onOpenAdd: () =>
    set({ mode: "add", budgetId: null, budgetData: null, isOpen: true }),
  onClose: () =>
    set({ isOpen: false, budgetId: null, budgetData: null, mode: "view" }),
}));
