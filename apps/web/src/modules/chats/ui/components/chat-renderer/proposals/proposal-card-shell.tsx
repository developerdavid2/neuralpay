"use client";

import type { ReactNode } from "react";
import { ConfirmationBar } from "../confirmation-bar";

interface Props {
  title: string;
  subtitle?: string;
  reasoning: string;
  summary: string;
  variant?: "default" | "destructive";
  children?: ReactNode;
  onConfirm: () => Promise<void>;
  sendMessage: (text: string) => void;
}

export function ProposalCardShell({
  title,
  subtitle,
  reasoning,
  summary,
  variant = "default",
  children,
  onConfirm,
  sendMessage,
}: Props) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3 max-w-md">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle ? (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{reasoning}</p>

      {children}

      <ConfirmationBar
        summary={summary}
        variant={variant}
        sendMessage={sendMessage}
        onConfirm={onConfirm}
      />
    </div>
  );
}
