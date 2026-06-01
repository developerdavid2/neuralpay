"use client";

import { PremiumButton } from "@/components/premium-button";
import { useAccountDrawer } from "@/hooks/accounts/use-account-drawer";
import { PlusIcon } from "lucide-react";

export function NewAccountButton() {
  const { onOpenAdd } = useAccountDrawer();

  return (
    <PremiumButton icon={PlusIcon} className="w-fit" onClick={onOpenAdd}>
      New Account
    </PremiumButton>
  );
}
