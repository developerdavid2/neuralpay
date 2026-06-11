"use client";

import { useCallback, useMemo } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
} from "@neuralpay/ui/components/ai-elements/prompt-input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "../../store/use-chat-store";
import { useSendMessage } from "../../hooks/mutations/use-send-message";
import { useStartSession } from "../../hooks/mutations/use-start-session";
import { useUsage } from "../../hooks/queries/use-usage";
import { ChatSuggestions } from "./chat-suggestions";

export function ChatInput() {
  const { activeSessionId, inputText, setInputText, isStreaming } =
    useChatStore();

  const sendMessage = useSendMessage();
  const startSession = useStartSession();
  const { data: usage } = useUsage();

  const isQuotaExceeded = useMemo(() => {
    if (!usage) return false;
    return usage.queryCount >= 20; // free tier check
  }, [usage]);

  const handleSubmit = useCallback(
    async (message: { text: string; files?: File[] }) => {
      if (!message.text.trim()) return;

      if (isQuotaExceeded) {
        toast.error("AI quota exceeded", {
          description: "Upgrade to Pro for unlimited AI queries",
        });
        return;
      }

      const content = message.text.trim();

      // If no active session, create one first
      if (!activeSessionId) {
        const session = await startSession.mutateAsync({
          contextType: "general",
          topic: "general",
          title: content.slice(0, 50),
        });

        useChatStore.getState().setActiveSessionId(session.id);

        // Then send the message
        await sendMessage.mutateAsync({
          sessionId: session.id,
          content,
        });
      } else {
        await sendMessage.mutateAsync({
          sessionId: activeSessionId,
          content,
        });
      }

      setInputText("");
    },
    [activeSessionId, isQuotaExceeded, sendMessage, startSession, setInputText],
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSubmit({ text });
    },
    [handleSubmit],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    [setInputText],
  );

  const isSubmitDisabled = useMemo(() => {
    return !inputText.trim() || sendMessage.isPending || startSession.isPending;
  }, [inputText, sendMessage.isPending, startSession.isPending]);

  const status = useMemo(() => {
    if (sendMessage.isPending || startSession.isPending)
      return "submitted" as const;
    if (isStreaming) return "streaming" as const;
    return "ready" as const;
  }, [sendMessage.isPending, startSession.isPending, isStreaming]);

  return (
    <div className="w-full space-y-3">
      {/* Context-aware suggestions */}
      {activeSessionId && !sendMessage.isPending && (
        <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
      )}

      {isQuotaExceeded && (
        <div className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          You've reached your free tier limit. Upgrade to Pro for unlimited AI
          coaching.
        </div>
      )}

      <PromptInput onSubmit={() => {}}>
        <PromptInputBody>
          <PromptInputTextarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Ask about your finances..."
            className="min-h-[56px] max-h-[200px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isSubmitDisabled) {
                  handleSubmit({ text: inputText });
                }
              }
            }}
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton variant="ghost" size="icon-sm">
              <span className="text-xs text-muted-foreground">
                {usage ? `${usage.queryCount}/20 queries` : ""}
              </span>
            </PromptInputButton>
          </PromptInputTools>

          <PromptInputSubmit disabled={isSubmitDisabled} status={status}>
            {status === "submitted" || status === "streaming" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
