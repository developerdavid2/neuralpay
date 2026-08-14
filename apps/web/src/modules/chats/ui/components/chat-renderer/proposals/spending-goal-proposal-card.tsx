"use client";

import { formatAmount } from "@/lib/utils";
import { ProposalCardShell } from "./proposal-card-shell";

interface Props {
  draft: {
    targetAmount: number;
    timeframe: "this_week" | "this_month";
  };
  reasoning: string;
  sendMessage: (text: string) => void;
}

const TIMEFRAME_LABEL: Record<string, string> = {
  this_week: "this week",
  this_month: "this month",
};

export function SpendingGoalProposalCard({
  draft,
  reasoning,
  sendMessage,
}: Props) {
  return (
    <ProposalCardShell
      title="Spending goal"
      subtitle={`Keep total spend under ${formatAmount(draft.targetAmount)} ${
        TIMEFRAME_LABEL[draft.timeframe] ?? draft.timeframe
      }`}
      reasoning={reasoning}
      summary={`spending limit of ${formatAmount(draft.targetAmount)} ${
        TIMEFRAME_LABEL[draft.timeframe] ?? draft.timeframe
      }`}
      onConfirm={async () => {
        // Goals are tracked conversationally — no persistence mutation yet.
      }}
      sendMessage={sendMessage}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Target</span>
        <span className="font-medium">{formatAmount(draft.targetAmount)}</span>
      </div>
    </ProposalCardShell>
  );
}
