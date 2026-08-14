"use client";

import { Badge } from "@neuralpay/ui/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@neuralpay/ui/components/collapsible";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  ClockIcon,
  ShieldXIcon,
  TimerResetIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

export interface ToolStatusMeta {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  icon: ReactNode;
}

export const getStatusMeta = (state?: ToolState): ToolStatusMeta => {
  switch (state) {
    case "input-streaming":
      return {
        label: "Pending",
        variant: "secondary",
        icon: <ClockIcon />,
      };
    case "input-available":
      return {
        label: "Running",
        variant: "outline",
        icon: <Spinner />,
      };
    case "approval-requested":
      return {
        label: "Awaiting approval",
        variant: "outline",
        icon: <CircleDotIcon />,
      };
    case "approval-responded":
      return {
        label: "Responded",
        variant: "secondary",
        icon: <TimerResetIcon />,
      };
    case "output-available":
      return {
        label: "Completed",
        variant: "secondary",
        icon: <CheckCircle2Icon />,
      };
    case "output-error":
      return {
        label: "Error",
        variant: "destructive",
        icon: <XCircleIcon />,
      };
    case "output-denied":
      return {
        label: "Denied",
        variant: "destructive",
        icon: <ShieldXIcon />,
      };
    default:
      return {
        label: "Idle",
        variant: "ghost",
        icon: <CircleDotIcon />,
      };
  }
};

export const getStatusBadge = (state?: ToolState) => {
  const { icon, label, variant } = getStatusMeta(state);
  return (
    <Badge variant={variant} className="gap-1 capitalize">
      {icon}
      {label}
    </Badge>
  );
};

const camelToTitle = (name: string): string =>
  name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

export type ToolProps = ComponentProps<typeof Collapsible> & {
  state?: ToolState;
  defaultOpen?: boolean;
};

export const Tool = ({
  state,
  defaultOpen = false,
  className,
  children,
  ...props
}: ToolProps) => {
  const isDone =
    state === "output-available" ||
    state === "output-error" ||
    state === "output-denied" ||
    state === "approval-responded";
  const [isOpen, setIsOpen] = useState(defaultOpen || isDone);

  useEffect(() => {
    if (isDone) {
      setIsOpen(true);
    }
  }, [isDone]);

  return (
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
  );
};

export type ToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  title?: string;
  type?: string;
  state?: ToolState;
  toolName?: string;
  icon?: ReactNode;
};

export const ToolHeader = ({
  title,
  type,
  state,
  toolName,
  icon,
  className,
  ...props
}: ToolHeaderProps) => {
  const name = title ?? camelToTitle(toolName ?? type ?? "");

  return (
    <CollapsibleTrigger
      className={cn(
        "group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon ?? <WrenchIcon className="size-4" />}
      </span>
      <span className="flex-1 truncate text-sm font-medium">{name}</span>
      {state ? getStatusBadge(state) : null}
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({
  className,
  children,
  ...props
}: ToolContentProps) => (
  <CollapsibleContent
    className={cn("border-t px-3 py-3", className)}
    {...props}
  >
    {children}
  </CollapsibleContent>
);

export type ToolInputProps = ComponentProps<"div"> & {
  input?: unknown;
};

export const ToolInput = ({ input, className, ...props }: ToolInputProps) => {
  const isEmpty =
    input === undefined ||
    input === null ||
    (typeof input === "object" && Object.keys(input).length === 0);

  if (isEmpty) {
    return null;
  }

  return (
    <div className={cn("mb-2", className)} {...props}>
      <p className="mb-1 text-xs font-medium text-muted-foreground">Input</p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-2 font-mono text-xs text-muted-foreground">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  );
};

export type ToolOutputProps = ComponentProps<"div"> & {
  output?: ReactNode;
  errorText?: string;
};

export const ToolOutput = ({
  output,
  errorText,
  className,
  ...props
}: ToolOutputProps) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {errorText && (
      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0 flex-1">{errorText}</span>
      </div>
    )}
    {!errorText && output !== undefined && output !== null ? (
      output
    ) : !errorText ? (
      <p className="text-sm text-muted-foreground">No output.</p>
    ) : null}
  </div>
);
