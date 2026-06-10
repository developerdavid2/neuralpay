import type { Transaction, TransactionStatus } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";
import { Building2, FileText, Landmark, Pencil, Wallet } from "lucide-react";
import { TRANSACTION_STATUS_STYLES } from "../../constants";

interface StatusBadgeProps {
  status: TransactionStatus | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  const style =
    TRANSACTION_STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";

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

interface SourceBadgeProps {
  tx: Transaction;
  variant?: "text" | "badge";
  className?: string;
}

function getSourceMeta(tx: Transaction) {
  if (tx.isManual) {
    return {
      label: "Manual",
      icon: Pencil,
      color: "text-muted-foreground",
      badgeVariant: "outline" as const,
    };
  }
  if (tx.plaidTxId) {
    return {
      label: "Plaid",
      icon: Landmark,
      color: "text-blue-600 dark:text-blue-400",
      badgeVariant: "secondary" as const,
    };
  }
  if (tx.monoTxId) {
    return {
      label: "Mono",
      icon: Building2,
      color: "text-purple-600 dark:text-purple-400",
      badgeVariant: "secondary" as const,
    };
  }
  if (tx.csvImportId) {
    return {
      label: "CSV",
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      badgeVariant: "outline" as const,
    };
  }
  return {
    label: "Unknown",
    icon: Wallet,
    color: "text-muted-foreground",
    badgeVariant: "ghost" as const,
  };
}

export function SourceBadge({
  tx,
  variant = "text",
  className,
}: SourceBadgeProps) {
  const meta = getSourceMeta(tx);
  const Icon = meta.icon;

  if (variant === "badge") {
    return (
      <Badge
        variant={meta.badgeVariant}
        className={cn("gap-1 text-[10px] font-medium", meta.color, className)}
      >
        <Icon className="size-3" />
        {meta.label}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[10px]",
        meta.color,
        className,
      )}
    >
      {/* <Icon className="size-3" /> */}
      {meta.label}
    </span>
  );
}
