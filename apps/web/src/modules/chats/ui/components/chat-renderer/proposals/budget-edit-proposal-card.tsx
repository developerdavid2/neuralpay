"use client";

import type { BudgetCategoryAllocation } from "@neuralpay/types";
import { formatAmount } from "@/lib/utils";
import { useUpdateBudget } from "@/modules/budgets/hooks/mutations/use-update-budget";
import { ProposalCardShell } from "./proposal-card-shell";

interface BudgetSnapshot {
  name: string;
  limitAmount: number;
  alertThreshold: number;
  categories: Array<{ category: string; limitAmount: number }>;
}

interface Props {
  budgetId: string;
  current: BudgetSnapshot;
  proposed: BudgetSnapshot;
  reasoning: string;
  sendMessage: (text: string) => void;
}

function Row({
  label,
  current,
  proposed,
}: {
  label: string;
  current: string;
  proposed: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span>
        <span className="text-muted-foreground line-through">{current}</span>
        <span className="mx-1.5 text-muted-foreground">→</span>
        <span className="font-medium">{proposed}</span>
      </span>
    </div>
  );
}

export function BudgetEditProposalCard({
  budgetId,
  current,
  proposed,
  reasoning,
  sendMessage,
}: Props) {
  const updateBudget = useUpdateBudget();

  return (
    <ProposalCardShell
      title={proposed.name}
      subtitle="Budget changes"
      reasoning={reasoning}
      summary={`changes to ${proposed.name} budget`}
      onConfirm={async () => {
        await updateBudget.mutateAsync({
          id: budgetId,
          name: proposed.name,
          limitAmount: proposed.limitAmount,
          alertThreshold: proposed.alertThreshold,
          categories: proposed.categories as BudgetCategoryAllocation[],
        });
      }}
      sendMessage={sendMessage}
    >
      <div className="space-y-1.5">
        <Row
          label="Limit"
          current={formatAmount(current.limitAmount)}
          proposed={formatAmount(proposed.limitAmount)}
        />
        <Row
          label="Alert"
          current={`${current.alertThreshold}%`}
          proposed={`${proposed.alertThreshold}%`}
        />
        {current.categories
          .filter(
            (c) =>
              proposed.categories.find((p) => p.category === c.category)
                ?.limitAmount !== c.limitAmount,
          )
          .map((c) => {
            const next = proposed.categories.find(
              (p) => p.category === c.category,
            );
            if (!next) {
              return (
                <Row
                  key={c.category}
                  label={c.category.replace(/_/g, " ")}
                  current={formatAmount(c.limitAmount)}
                  proposed="Removed"
                />
              );
            }
            return (
              <Row
                key={c.category}
                label={c.category.replace(/_/g, " ")}
                current={formatAmount(c.limitAmount)}
                proposed={formatAmount(next.limitAmount)}
              />
            );
          })}
        {proposed.categories
          .filter(
            (p) =>
              !current.categories.some((c) => c.category === p.category),
          )
          .map((p) => (
            <Row
              key={p.category}
              label={p.category.replace(/_/g, " ")}
              current="—"
              proposed={formatAmount(p.limitAmount)}
            />
          ))}
      </div>
    </ProposalCardShell>
  );
}
