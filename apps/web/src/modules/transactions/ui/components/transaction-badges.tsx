import type { TransactionStatus, Transaction } from "@neuralpay/types";
import { Badge } from "@neuralpay/ui/components/badge";
import { cn } from "@neuralpay/ui/lib/utils";
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

export function SourceBadge({ tx }: { tx: Transaction }) {
  if (tx.isManual)
    return <span className="text-[10px] text-muted-foreground">Manual</span>;
  if (tx.plaidTxId)
    return <span className="text-[10px] text-blue-600">Plaid</span>;
  if (tx.monoTxId)
    return <span className="text-[10px] text-violet-600">Mono</span>;
  if (tx.csvImportId)
    return <span className="text-[10px] text-amber-600">CSV</span>;
  return null;
}
