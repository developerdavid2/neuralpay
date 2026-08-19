"use client";

import { Button } from "@orra/ui/components/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface Props {
  summary: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void>;
  sendMessage: (text: string) => void;
}

export function ConfirmationBar({
  summary,
  variant = "default",
  onConfirm,
  sendMessage,
}: Props) {
  const [status, setStatus] = useState<
    "pending" | "loading" | "confirmed" | "declined"
  >("pending");

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      await onConfirm();
      setStatus("confirmed");
      sendMessage(`I confirmed: ${summary}. It's been applied successfully.`);
    } catch (err) {
      setStatus("pending");
      sendMessage(
        `I tried to confirm "${summary}" but it failed: ${err instanceof Error ? err.message : "unknown error"}. Can you help me figure out what to do?`,
      );
    }
  };

  const handleDecline = () => {
    setStatus("declined");
    sendMessage(
      `I decided not to go ahead with: ${summary}. Please don't repeat the same suggestion — ask if I'd like something different instead.`,
    );
  };

  if (status === "confirmed") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-emerald-500">
        <Check className="size-3.5" /> Done — {summary}
      </p>
    );
  }
  if (status === "declined") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <X className="size-3.5" /> Skipped
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={variant === "destructive" ? "destructive" : "default"}
        disabled={status === "loading"}
        onClick={handleConfirm}
      >
        {status === "loading" ? "Working…" : "Confirm"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={status === "loading"}
        onClick={handleDecline}
      >
        Cancel
      </Button>
    </div>
  );
}
