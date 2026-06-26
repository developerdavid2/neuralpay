"use client";

import { PremiumButton } from "@/components/premium-button";

import { PlusIcon } from "lucide-react";
import { useAccountDrawer } from "../../hooks/store/use-account-drawer";
import { useAccountUrlSync } from "../../hooks/use-account-url-sync";

export function NewAccountButton() {
  const { onOpenAdd } = useAccountDrawer();

  const { setUrl } = useAccountUrlSync();

  const handleClick = () => {
    setUrl("add", null);
    onOpenAdd();
  };

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={handleClick}>
      New Account
    </PremiumButton>
  );
}
