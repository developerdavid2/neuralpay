"use client";

import type { BudgetCategoryAllocation } from "@orra/types";
import { format } from "date-fns";
import { formatAmount } from "@/lib/utils";
import { useCreateBudget } from "@/modules/budgets/hooks/mutations/use-create-budget";
import { ConfirmationBar } from "../confirmation-bar";

interface Props {
  proposalId: string;
  draft: {
    name: string;
    period: string;
    limitAmount: number;
    categories: Array<{ category: string; limitAmount: number }>;
    alertThreshold: number;
    startDate: string;
    endDate: string;
  };
  reasoning: string;
  sendMessage: (text: string) => void;
}

export function BudgetProposalCard({
  proposalId,
  draft,
  reasoning,
  sendMessage,
}: Props) {
  const createBudget = useCreateBudget();

  const summary = `${draft.name} budget — ${formatAmount(draft.limitAmount)}/${draft.period}`;

  return (
    <div className="rounded-xl border border-border p-4 space-y-3 max-w-md">
      <div>
        <p className="text-sm font-semibold">{draft.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{reasoning}</p>
      </div>

      <div className="space-y-1.5">
        {draft.categories.map((c) => (
          <div
            key={c.category}
            className="flex items-center justify-between text-xs"
          >
            <span className="capitalize text-muted-foreground">
              {c.category.replace(/_/g, " ")}
            </span>
            <span className="font-medium">{formatAmount(c.limitAmount)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
        <span>
          {format(new Date(draft.startDate), "MMM d")} –{" "}
          {format(new Date(draft.endDate), "MMM d")}
        </span>
        <span>Alert at {draft.alertThreshold}%</span>
      </div>

      <ConfirmationBar
        summary={summary}
        sendMessage={sendMessage}
        onConfirm={async () => {
          await createBudget.mutateAsync({
            name: draft.name,
            period: draft.period as "weekly" | "monthly" | "custom",
            limitAmount: draft.limitAmount,
            categories: draft.categories as BudgetCategoryAllocation[],
            alertThreshold: draft.alertThreshold,
            startDate: draft.startDate,
            endDate: draft.endDate,
            accountIds: [],
          });
        }}
      />
    </div>
  );
}
