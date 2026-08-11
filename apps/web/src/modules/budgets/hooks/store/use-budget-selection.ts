import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface BudgetSelectionState {
  selectedIds: Set<string>;
  selectedArray: string[];
  allBudgetIds: string[];
  setAllBudgetIds: (ids: string[]) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSelectMany: (ids: string[], checked: boolean) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
}

export const useBudgetSelectionStore = create<BudgetSelectionState>(
  (set, get) => ({
    selectedIds: new Set(),
    selectedArray: [],
    allBudgetIds: [],

    setAllBudgetIds: (ids) => set({ allBudgetIds: ids }),

    onSelect: (id, checked) => {
      const next = new Set(get().selectedIds);
      if (checked) next.add(id);
      else next.delete(id);
      set({ selectedIds: next, selectedArray: Array.from(next) });
    },

    onSelectMany: (ids, checked) => {
      const next = new Set(get().selectedIds);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      set({ selectedIds: next, selectedArray: Array.from(next) });
    },

    onSelectAll: (ids) => {
      const { selectedIds } = get();
      const shouldClear = selectedIds.size === ids.length && ids.length > 0;
      const next = shouldClear ? new Set<string>() : new Set(ids);
      set({ selectedIds: next, selectedArray: Array.from(next) });
    },

    onClearSelection: () => set({ selectedIds: new Set(), selectedArray: [] }),
  }),
);

export const useSelectedIds = () =>
  useBudgetSelectionStore((s) => s.selectedIds);
export const useSelectedArray = () =>
  useBudgetSelectionStore((s) => s.selectedArray);
export const useAllBudgetIds = () =>
  useBudgetSelectionStore((s) => s.allBudgetIds);

export const useBudgetSelectionActions = () =>
  useBudgetSelectionStore(
    useShallow((s) => ({
      setAllBudgetIds: s.setAllBudgetIds,
      onSelect: s.onSelect,
      onSelectMany: s.onSelectMany,
      onSelectAll: s.onSelectAll,
      onClearSelection: s.onClearSelection,
    })),
  );
