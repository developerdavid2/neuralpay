"use client";

import { Switch } from "@neuralpay/ui/components/switch";
import { useToggleAccountStatus } from "../../hooks/mutations/use-toggle-account-status";

interface AccountStatusToggleProps {
  accountId: string;
  currentStatus: "active" | "inactive";
  disabled?: boolean;
}

export function AccountStatusToggle({
  accountId,
  currentStatus,
  disabled = false,
}: AccountStatusToggleProps) {
  const toggle = useToggleAccountStatus();

  const handleToggle = (checked: boolean) => {
    toggle.mutate({
      id: accountId,
      status: checked ? "active" : "inactive",
    });
  };

  return (
    <Switch
      checked={currentStatus === "active"}
      onCheckedChange={handleToggle}
      disabled={disabled || toggle.isPending}
      aria-label={`${currentStatus === "active" ? "Deactivate" : "Activate"} account`}
    />
  );
}
