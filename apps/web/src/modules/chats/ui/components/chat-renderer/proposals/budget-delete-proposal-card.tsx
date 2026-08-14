"use client";

import { useDeleteBudget } from "@/modules/budgets/hooks/mutations/use-delete-budget";
import { ProposalCardShell } from "./proposal-card-shell";

interface Props {
  budgetId: string;
  budgetName: string;
  reasoning: string;
  sendMessage: (text: string) => void;
}

export function BudgetDeleteProposalCard({
  budgetId,
  budgetName,
  reasoning,
  sendMessage,
}: Props) {
  const deleteBudget = useDeleteBudget();

  return (
    <ProposalCardShell
      title={`Delete ${budgetName}`}
      subtitle="Permanent — this can't be undone"
      reasoning={reasoning}
      summary={`delete the ${budgetName} budget`}
      variant="destructive"
      onConfirm={async () => {
        await deleteBudget.mutateAsync({ id: budgetId });
      }}
      sendMessage={sendMessage}
    />
  );
}
