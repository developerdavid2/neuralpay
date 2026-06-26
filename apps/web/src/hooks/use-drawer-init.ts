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
  const appliedKey = useRef<string | null>(null);

  useEffect(() => {
    const nextKey = `${mode ?? "view"}:${focusId ?? ""}`;
    if (appliedKey.current === nextKey) return;

    const drawer = getState();
    const isAddMode = mode === "add";

    if (isAddMode) {
      if (!drawer.isOpen || drawer.mode !== "add") {
        drawer.onOpenAdd();
      }
      appliedKey.current = nextKey;
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

    appliedKey.current = nextKey;
  }, [focusId, mode, data, isLoading, getState, getCurrentId]);
}
