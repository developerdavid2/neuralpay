"use client";

import { PremiumButton } from "@/components/premium-button";
import { PlusIcon } from "lucide-react";
import { useProviderModal } from "../../hooks/store/use-provider-modal";

export function ConnectBankAccountButton() {
  const { openModal, confirmedProvider } = useProviderModal();
  const isInitializing = confirmedProvider !== null;

  return (
    <PremiumButton
      icon={PlusIcon}
      isLoading={isInitializing}
      className="w-fit"
      onClick={() => openModal()}
    >
      {isInitializing ? "Initializing..." : "Connect a Bank"}
    </PremiumButton>
  );
}
