// hooks/use-drawer-init.ts
"use client";

import { useEffect, useRef } from "react";

type DrawerActions<TData> = {
  isOpen: boolean;
  mode: string;
  onOpenView: (id: string, data?: TData) => void;
  onOpenEdit: (id: string, data?: TData) => void;
  onOpenAdd: () => void;
};

export function useDrawerInit<TData, TState extends DrawerActions<TData>>(
  focusId: string | undefined,
  mode: string | undefined,
  data: TData | undefined,
  isLoading: boolean,
  getState: () => TState,
  getCurrentId: (state: TState) => string | null | undefined,
) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const drawer = getState();
    const isAddMode = mode === "add";

    if (isAddMode) {
      if (!drawer.isOpen || drawer.mode !== "add") {
        drawer.onOpenAdd();
      }
      initialized.current = true;
      return;
    }

    if (!focusId) return;
    if (isLoading) return;

    const currentId = getCurrentId(drawer);
    if (!drawer.isOpen || currentId !== focusId) {
      const validMode = mode === "edit" ? "edit" : "view";
      if (validMode === "edit") {
        drawer.onOpenEdit(focusId, data);
      } else {
        drawer.onOpenView(focusId, data);
      }
    }

    initialized.current = true;
  }, [focusId, mode, data, isLoading, getState, getCurrentId]);
}
