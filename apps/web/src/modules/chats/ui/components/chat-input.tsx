import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@neuralpay/ui/components/ai-elements/prompt-input";
import { Loader2, Send } from "lucide-react";
import { useMemo } from "react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const isSubmitDisabled = useMemo(() => {
    return !input?.trim() || isLoading;
  }, [input, isLoading]);

  const status = useMemo(() => {
    if (isLoading) return "streaming" as const;
    return "ready" as const;
  }, [isLoading]);

  return (
    <div className="w-full space-y-3">
      <PromptInput onSubmit={(_message) => onSubmit()}>
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={onInputChange}
            placeholder="Ask about your finances..."
            className="min-h-[70px] max-h-[200px]"
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton
              variant="ghost"
              size="icon-sm"
              className="pl-4 w-fit text-center"
            >
              <span className="text-xs text-muted-foreground">
                1/20 queries
              </span>
            </PromptInputButton>
          </PromptInputTools>

          <PromptInputSubmit disabled={isSubmitDisabled} status={status}>
            {isLoading ? (
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
