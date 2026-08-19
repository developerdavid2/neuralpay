"use client";

import type { TransactionCategory } from "@orra/types";
import { formatAmountSigned } from "@/lib/utils";
import { useUpdateTransaction } from "@/modules/transactions/hooks/mutations/use-update-transaction";
import { ProposalCardShell } from "./proposal-card-shell";

interface Change {
  transactionId: string;
  description: string | null;
  merchant: string | null;
  amount: number | null;
  from: string;
  to: string;
}

interface Props {
  targetCategory: string;
  changes: Change[];
  reasoning: string;
  sendMessage: (text: string) => void;
}

export function RecategorizeProposalCard({
  targetCategory,
  changes,
  reasoning,
  sendMessage,
}: Props) {
  const updateTransaction = useUpdateTransaction();

  return (
    <ProposalCardShell
      title={`Recategorize ${changes.length} transaction${
        changes.length === 1 ? "" : "s"
      } to ${targetCategory.replace(/_/g, " ")}`}
      reasoning={reasoning}
      summary={`recategorize ${changes.length} transaction${
        changes.length === 1 ? "" : "s"
      } to ${targetCategory.replace(/_/g, " ")}`}
      onConfirm={async () => {
        await Promise.all(
          changes.map((c) =>
            updateTransaction.mutateAsync({
              id: c.transactionId,
              category: targetCategory as TransactionCategory,
            }),
          ),
        );
      }}
      sendMessage={sendMessage}
    >
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {changes.map((c) => (
          <div key={c.transactionId} className="space-y-0.5 px-2.5 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium">
                {c.description ?? c.merchant ?? "Transaction"}
              </span>
              <span className="ml-2 shrink-0">
                {c.amount !== null ? formatAmountSigned(c.amount) : ""}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              <span className="line-through">{c.from.replace(/_/g, " ")}</span>
              <span className="mx-1.5">→</span>
              {c.to.replace(/_/g, " ")}
            </p>
          </div>
        ))}
      </div>
    </ProposalCardShell>
  );
}
