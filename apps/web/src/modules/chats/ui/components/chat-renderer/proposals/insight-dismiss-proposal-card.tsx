"use client";

import { useDismissInsight } from "@/modules/insights/hooks/mutations/use-dismiss-insight";
import { ProposalCardShell } from "./proposal-card-shell";

interface Props {
  insightId: string;
  insightTitle: string;
  reasoning: string;
  sendMessage: (text: string) => void;
}

export function InsightDismissProposalCard({
  insightId,
  insightTitle,
  reasoning,
  sendMessage,
}: Props) {
  const dismissInsight = useDismissInsight();

  return (
    <ProposalCardShell
      title={`Dismiss insight`}
      subtitle={insightTitle}
      reasoning={reasoning}
      summary={`dismiss the insight "${insightTitle}"`}
      variant="destructive"
      onConfirm={async () => {
        await dismissInsight.mutateAsync({ id: insightId });
      }}
      sendMessage={sendMessage}
    />
  );
}
