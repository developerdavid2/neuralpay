import type { AccountStatus, AccountType } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";

import { ACCOUNT_STATUS_CONFIG, ACCOUNT_TYPE_CONFIG } from "../../constants";

interface StatusBadgeProps {
  status: AccountStatus | null;
  className?: string;
}

export function AccountStatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  const style =
    ACCOUNT_STATUS_CONFIG[status]["color"] ?? "bg-muted text-muted-foreground";

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
  labelClassName?: string;
  iconClassName?: string;
  className?: string;
}

export function AccountTypeBadge({
  type,
  variant = "badge",
  iconClassName,
  className,
  labelClassName,
}: TypeBadgeProps) {
  const Icon = ACCOUNT_TYPE_CONFIG[type]["icon"];
  const IconBg = ACCOUNT_TYPE_CONFIG[type]["iconBg"];
  const label = ACCOUNT_TYPE_CONFIG[type]["label"];

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex items-center justify-center rounded-lg p-1.5",
            IconBg,
            className,
          )}
        >
          <Icon
            className={cn("size-3.5 text-white", iconClassName)}
            strokeWidth={1.8}
          />
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold text-white/70 tracking-wide",
            labelClassName,
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 text-[10px] font-medium", className)}
    >
      <Icon className={cn("size-3", iconClassName)} />
      {label}
    </Badge>
  );
}
