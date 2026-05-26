export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  successful: "Successful",
  refunded: "Refunded",
  reversed: "Reversed",
  failed: "Failed",
};

export const TRANSACTION_STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  successful:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  refunded:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  reversed:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  debit: "Debit",
  credit: "Credit",
};

export const TRANSACTION_TYPES = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" },
] as const;
