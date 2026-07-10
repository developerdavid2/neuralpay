import { create } from "zustand";

type Provider = "plaid" | "mono";

interface ProviderModalStore {
  isOpen: boolean;
  selectedProvider: Provider | null;
  confirmedProvider: Provider | null;
  openModal: () => void;
  closeModal: (options?: { cancelFlow?: boolean }) => void;
  selectProvider: (provider: Provider) => void;
  confirmProvider: () => void;
  resetState: () => void;
}

export const useProviderModal = create<ProviderModalStore>((set, get) => ({
  isOpen: false,
  selectedProvider: null,
  confirmedProvider: null,
  openModal: () => set({ isOpen: true, selectedProvider: null }),
  closeModal: (options) =>
    set((state) => ({
      isOpen: false,
      selectedProvider: null,
      confirmedProvider: options?.cancelFlow ? null : state.confirmedProvider,
    })),
  selectProvider: (provider) => set({ selectedProvider: provider }),
  confirmProvider: () =>
    set({
      confirmedProvider: get().selectedProvider,
      isOpen: true,
      selectedProvider: null,
    }),
  resetState: () =>
    set({ selectedProvider: null, confirmedProvider: null, isOpen: false }),
}));
