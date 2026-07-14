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
    const drawer = getState();
    const isAddMode = mode === "add";

    if (isAddMode) {
      if (!drawer.isOpen || drawer.mode !== "add") {
        drawer.onOpenAdd();
      }
      appliedKey.current = nextKey;
      return;
    }

    if (!focusId) {
      appliedKey.current = nextKey;
      return;
    }

    if (isLoading) return;

    const validMode = mode === "edit" ? "edit" : "view";
    const currentId = getCurrentId(drawer);
    const isSameTarget =
      drawer.isOpen && drawer.mode === validMode && currentId === focusId;

    if (isSameTarget) {
      appliedKey.current = nextKey;
      return;
    }

    if (validMode === "edit") {
      drawer.onOpenEdit(focusId, data);
    } else {
      drawer.onOpenView(focusId, data);
    }

    appliedKey.current = nextKey;
  }, [focusId, mode, data, isLoading, getState, getCurrentId]);
}
