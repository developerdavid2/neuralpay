"use client";

import { formatAmount } from "@/lib/utils";
import { useUpdateBudget } from "@/modules/budgets/hooks/mutations/use-update-budget";
import { ProposalCardShell } from "./proposal-card-shell";

interface RebalanceStep {
  order: number;
  budgetId: string;
  budgetName: string;
  currentLimit: number | null;
  newLimit: number | null;
  changeAmount: number;
  reason: string;
}

interface Props {
  steps: RebalanceStep[];
  overallReasoning: string;
  sendMessage: (text: string) => void;
}

export function BudgetRebalanceProposalCard({
  steps,
  overallReasoning,
  sendMessage,
}: Props) {
  const updateBudget = useUpdateBudget();

  return (
    <ProposalCardShell
      title={`Rebalance ${steps.length} budgets`}
      reasoning={overallReasoning}
      summary={`rebalance plan across ${steps.length} budgets`}
      onConfirm={async () => {
        await Promise.all(
          steps
            .filter((s) => s.newLimit !== null)
            .map((s) =>
              updateBudget.mutateAsync({
                id: s.budgetId,
                limitAmount: s.newLimit as number,
              }),
            ),
        );
      }}
      sendMessage={sendMessage}
    >
      <div className="space-y-2">
        {steps.map((s) => (
          <div
            key={s.budgetId}
            className="rounded-lg border border-border p-2.5 space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{s.budgetName}</span>
              <span>
                {s.currentLimit !== null ? (
                  <>
                    <span className="text-muted-foreground line-through">
                      {formatAmount(s.currentLimit)}
                    </span>
                    <span className="mx-1.5 text-muted-foreground">→</span>
                  </>
                ) : null}
                <span className="font-medium">
                  {s.newLimit !== null ? formatAmount(s.newLimit) : "Unknown"}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{s.reason}</p>
          </div>
        ))}
      </div>
    </ProposalCardShell>
  );
}
