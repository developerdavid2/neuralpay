import { create } from "zustand";

type Provider = "plaid" | "mono";

interface ProviderModalStore {
  isOpen: boolean;
  selectedProvider: Provider | null;
  confirmedProvider: Provider | null;
  openModal: () => void;
  closeModal: () => void;
  selectProvider: (provider: Provider) => void;
  confirmProvider: () => void;
  resetState: () => void;
}

export const useProviderModal = create<ProviderModalStore>((set, get) => ({
  isOpen: false,
  selectedProvider: null,
  confirmedProvider: null,
  openModal: () => set({ isOpen: true, selectedProvider: null }),
  // only resets selection, does NOT touch confirmedProvider
  closeModal: () => set({ isOpen: false, selectedProvider: null }),
  selectProvider: (provider) => set({ selectedProvider: provider }),
  // keeps isOpen: true — PlaidController will call closeModal when ready
  confirmProvider: () =>
    set({
      confirmedProvider: get().selectedProvider,
      isOpen: true,
      selectedProvider: null,
    }),
  resetState: () =>
    set({ selectedProvider: null, confirmedProvider: null, isOpen: false }),
}));
