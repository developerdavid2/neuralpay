"use client";

import { Spinner } from "@neuralpay/ui/components/spinner";

const TOOL_LABELS: Record<string, string> = {
  renderSpendingChart: "Building your chart",
  getBudgetHealthSummary: "Checking your budgets",
  listActiveBudgets: "Looking up your budgets",
  getAccountBalances: "Checking your accounts",
  getAccountUtilization: "Analyzing account activity",
  searchTransactions: "Searching your transactions",
  getRecentTransactions: "Pulling recent transactions",
  getAnomalousTransactions: "Reviewing flagged transactions",
  comparePeriods: "Comparing spending periods",
  proposeBudgetCreate: "Drafting a budget proposal",
  proposeBudgetEdit: "Drafting budget changes",
  proposeBudgetDelete: "Preparing a deletion proposal",
  proposeBudgetRebalance: "Working out a rebalance plan",
  proposeRecategorize: "Preparing category changes",
  proposeAccountCreate: "Drafting a new account",
};

export function ToolCallIndicator({ toolName }: { toolName: string }) {
  const label = TOOL_LABELS[toolName] ?? "Working on it";
  return (
    <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
      <Spinner />
      <span>{label}…</span>
    </div>
  );
}
