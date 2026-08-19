"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@orra/ui/components/collapsible";
import { cn } from "@orra/ui/lib/utils";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration?: number;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);

  if (!context) {
    throw new Error(
      "Reasoning components must be used within a Reasoning component",
    );
  }

  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export const Reasoning = ({
  isStreaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  duration,
  className,
  children,
  ...props
}: ReasoningProps) => {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolledOpen;
  const prevStreaming = useRef(isStreaming);

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (prevStreaming.current === isStreaming) {
      return;
    }
    prevStreaming.current = isStreaming;
    setIsOpen(isStreaming);
  }, [isStreaming, setIsOpen]);

  const value = useMemo<ReasoningContextValue>(
    () => ({ duration, isOpen, isStreaming, setIsOpen }),
    [duration, isOpen, isStreaming, setIsOpen],
  );

  return (
    <ReasoningContext.Provider value={value}>
      <Collapsible
        className={cn(
          "w-full overflow-hidden rounded-xl border bg-card text-card-foreground",
          className,
        )}
        onOpenChange={setIsOpen}
        open={isOpen}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
};

const defaultThinkingMessage = (
  isStreaming: boolean,
  duration?: number,
): string => {
  if (isStreaming) {
    return "Thinking…";
  }
  if (duration !== undefined) {
    return `Thought for ${duration.toFixed(1)}s`;
  }
  return "Thought process";
};

export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

export const ReasoningTrigger = ({
  getThinkingMessage,
  className,
  ...props
}: ReasoningTriggerProps) => {
  const { isStreaming, duration } = useReasoning();
  const message = getThinkingMessage
    ? getThinkingMessage(isStreaming, duration)
    : defaultThinkingMessage(isStreaming, duration);

  return (
    <CollapsibleTrigger
      className={cn(
        "group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <BrainIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          isStreaming && "animate-pulse text-primary",
        )}
      />
      <span className="flex-1 truncate text-sm text-muted-foreground">
        {message}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = ({
  className,
  children,
  ...props
}: ReasoningContentProps) => (
  <CollapsibleContent
    className={cn("border-t px-3 py-3", className)}
    {...props}
  >
    <p className="text-pretty whitespace-pre-wrap font-mono text-xs text-muted-foreground">
      {children}
    </p>
  </CollapsibleContent>
);
