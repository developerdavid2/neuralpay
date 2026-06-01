import type { AccountStatus, AccountType } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";

import {
  ACCOUNT_STATUS_STYLES,
  ACCOUNT_TYPE_CONFIG,
  ACCOUNT_TYPE_LABELS,
} from "../../constants";

interface StatusBadgeProps {
  status: AccountStatus | null;
  className?: string;
}

export function AccountStatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  const style =
    ACCOUNT_STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider",
        style,
        className,
      )}
    >
      {status}
    </Badge>
  );
}

interface TypeBadgeProps {
  type: AccountType;
  variant?: "badge" | "icon";
  className?: string;
}

export function AccountTypeBadge({
  type,
  variant = "badge",
  className,
}: TypeBadgeProps) {
  const Icon = ACCOUNT_TYPE_CONFIG[type]["icon"];
  const label = ACCOUNT_TYPE_LABELS[type];

  if (variant === "icon") {
    return (
      <span
        className={cn(
          "flex items-center justify-center size-7 rounded-md bg-accent",
          className,
        )}
      >
        <Icon className="size-3.5 text-muted-foreground" />
      </span>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 text-[10px] font-medium", className)}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
