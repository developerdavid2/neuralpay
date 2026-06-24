"use client";

import { PremiumButton } from "@/components/premium-button";

import { PlusIcon } from "lucide-react";
import { useAccountDrawer } from "../../hooks/store/use-account-drawer";

export function NewAccountButton() {
  const { onOpenAdd } = useAccountDrawer();

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={onOpenAdd}>
      New Account
    </PremiumButton>
  );
}
