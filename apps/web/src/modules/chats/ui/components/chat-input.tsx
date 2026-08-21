import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
} from "@orra/ui/components/ai-elements/prompt-input";
import { Spinner } from "@orra/ui/components/spinner";
import { SUPPORTED_CHAT_MODELS, DEFAULT_CHAT_MODEL_ID, type SupportedChatModelId } from "@orra/types";
import type { ToolMode } from "@orra/types";
import { Send, Eye, Wrench } from "lucide-react";
import { useMemo } from "react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  mode?: ToolMode;
  onModeChange?: (mode: ToolMode) => void;
  model?: SupportedChatModelId;
  onModelChange?: (model: SupportedChatModelId) => void;
}

const MODE_OPTIONS: { value: ToolMode; label: string; icon: typeof Eye }[] = [
  { value: "plan", label: "Plan", icon: Eye },
  { value: "act", label: "Act", icon: Wrench },
];

const MODEL_GROUPS = [
  {
    label: "Groq (Fast & Cheap)",
    models: SUPPORTED_CHAT_MODELS.filter((m) => m.provider === "groq"),
  },
  {
    label: "OpenRouter",
    models: SUPPORTED_CHAT_MODELS.filter((m) => m.provider === "openrouter"),
  },
  {
    label: "AI Gateway",
    models: SUPPORTED_CHAT_MODELS.filter((m) => m.provider === "ai-gateway"),
  },
];

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  mode = "plan",
  onModeChange,
  model = DEFAULT_CHAT_MODEL_ID,
  onModelChange,
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
            className="min-h-17.5 max-h-50"
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputSelect
              value={model}
              onValueChange={(v) => onModelChange?.(v as SupportedChatModelId)}
            >
              <PromptInputSelectTrigger className="h-7 text-xs">
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {MODEL_GROUPS.map((group) => (
                  <PromptInputSelectItem
                    key={group.label}
                    value={group.models[0]?.id ?? model}
                    disabled
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {group.label}
                  </PromptInputSelectItem>
                ))}
                {MODEL_GROUPS.flatMap((group) =>
                  group.models.map((m) => (
                    <PromptInputSelectItem key={m.id} value={m.id} className="text-xs">
                      {m.id}
                    </PromptInputSelectItem>
                  )),
                )}
              </PromptInputSelectContent>
            </PromptInputSelect>

            <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
              {MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onModeChange?.(opt.value)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </PromptInputTools>

          <PromptInputSubmit disabled={isSubmitDisabled} status={status}>
            {isLoading ? (
              <Spinner className="size-4 " />
            ) : (
              <Send className="size-4" />
            )}
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
