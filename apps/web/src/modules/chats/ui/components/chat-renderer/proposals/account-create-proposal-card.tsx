"use client";

import type { AccountType } from "@orra/types";
import { formatAmount } from "@/lib/utils";
import { useCreateAccount } from "@/modules/accounts/hooks/mutations/use-create-account";
import { ProposalCardShell } from "./proposal-card-shell";

interface Props {
  draft: {
    name: string;
    type: string;
    balance: number;
    bankName: string | null;
  };
  reasoning: string;
  sendMessage: (text: string) => void;
}

export function AccountCreateProposalCard({
  draft,
  reasoning,
  sendMessage,
}: Props) {
  const createAccount = useCreateAccount();

  return (
    <ProposalCardShell
      title={draft.name}
      subtitle={
        draft.bankName ? `${draft.type} · ${draft.bankName}` : draft.type
      }
      reasoning={reasoning}
      summary={`${draft.name} ${draft.type} account`}
      onConfirm={async () => {
        await createAccount.mutateAsync({
          name: draft.name,
          type: draft.type as AccountType,
          balance: draft.balance,
          bankName: draft.bankName ?? undefined,
          isManual: true,
        });
      }}
      sendMessage={sendMessage}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="capitalize text-muted-foreground">{draft.type}</span>
        <span className="font-medium">{formatAmount(draft.balance)}</span>
      </div>
    </ProposalCardShell>
  );
}
