"use client";

import {
  AccountBalanceList,
  BudgetHealthGrid,
  BudgetProposalCard,
  ChatSpendingChart,
  ComparisonCard,
  ToolCallIndicator,
  TransactionList,
} from "./chat-renderer";

export interface ToolPart {
  toolName: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

// Query/render tools — pure data-in, JSX-out, no chat interaction needed.
const QUERY_RENDERERS: Record<string, (result: any) => React.ReactNode> = {
  renderSpendingChart: (result) => <ChatSpendingChart {...result} />,
  getBudgetHealthSummary: (result) => <BudgetHealthGrid data={result} />,
  listActiveBudgets: (result) => <BudgetHealthGrid data={result} />,
  getRecentTransactions: (result) => <TransactionList data={result} />,
  searchTransactions: (result) => <TransactionList data={result} />,
  getAnomalousTransactions: (result) => <TransactionList data={result} />,
  getAccountBalances: (result) => <AccountBalanceList data={result} />,
  getAccountUtilization: (result) => <AccountBalanceList data={result} />,
  comparePeriods: (result) => <ComparisonCard {...result} />,
};

// Propose tools — need sendMessage wired through for confirm/decline.
const PROPOSAL_RENDERERS: Record<
  string,
  (result: any, sendMessage: (text: string) => void) => React.ReactNode
> = {
  proposeBudgetCreate: (result, sendMessage) => (
    <BudgetProposalCard {...result} sendMessage={sendMessage} />
  ),
};

export function ChatToolPart({
  part,
  sendMessage,
}: {
  part: ToolPart;
  sendMessage?: (text: string) => void;
}) {
  // Loading states — tool call is being generated
  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="flex gap-3 max-w-[80%]">
        <div className="size-8 shrink-0" />
        <ToolCallIndicator toolName={part.toolName} />
      </div>
    );
  }

  // Error state
  if (part.state === "output-error") {
    return (
      <div className="flex gap-3 max-w-[80%]">
        <div className="size-8 shrink-0" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Tool error: {part.toolName}</p>
          <p className="mt-1">{part.errorText ?? "Unknown error"}</p>
        </div>
      </div>
    );
  }

  // Result state — render the output
  if (part.state === "output-available") {
    const result = part.output;

    if (PROPOSAL_RENDERERS[part.toolName]) {
      if (!sendMessage) {
        console.warn(
          `[ChatToolPart] Proposal tool "${part.toolName}" needs sendMessage`,
        );
        return null;
      }
      return (
        <div className="flex gap-3 max-w-[80%]">
          <div className="size-8 shrink-0" />
          {PROPOSAL_RENDERERS[part.toolName](result, sendMessage)}
        </div>
      );
    }

    const renderer = QUERY_RENDERERS[part.toolName];
    if (!renderer) {
      console.warn(`[ChatToolPart] No renderer for tool: ${part.toolName}`);
      return null;
    }

    return (
      <div className="flex gap-3 max-w-[80%]">
        <div className="size-8 shrink-0" />
        {renderer(result)}
      </div>
    );
  }

  // Fallback — shouldn't reach here if types are correct
  return null;
}
