"use client";

import { ChatSpendingChart } from "./chat-renderer/chat-spending-chart";

interface ToolPart {
  toolName: string;
  state: "call" | "result";
  result?: unknown;
}

const TOOL_RENDERERS: Record<string, (result: any) => React.ReactNode> = {
  renderSpendingChart: (result) => {
    // Defensive: ensure result has required fields
    if (!result || typeof result !== "object") return null;
    return <ChatSpendingChart {...result} />;
  },
};

export function ChatToolPart({ part }: { part: ToolPart }) {
  if (part.state !== "result" || !part.result) {
    return (
      <div className="flex gap-3 max-w-[80%]">
        <div className="size-8 shrink-0" />
        <div className="text-xs text-muted-foreground italic py-2">
          Building chart…
        </div>
      </div>
    );
  }

  const renderer = TOOL_RENDERERS[part.toolName];
  if (!renderer) {
    // Don't crash on unknown tools — log and skip
    console.warn(`[ChatToolPart] No renderer for tool: ${part.toolName}`);
    return null;
  }

  return (
    <div className="flex gap-3 max-w-[80%]">
      <div className="size-8 shrink-0" />
      {renderer(part.result)}
    </div>
  );
}
