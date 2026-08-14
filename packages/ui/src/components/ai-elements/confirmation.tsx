"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@neuralpay/ui/components/alert";
import { Button } from "@neuralpay/ui/components/button";
import { cn } from "@neuralpay/ui/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";

export interface Approval {
  id: string;
  status?: unknown;
  approved?: boolean;
}

export type ConfirmationState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

interface ConfirmationContextValue {
  approval: Approval;
  state?: ConfirmationState;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(
  null,
);

const useConfirmation = () => {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error(
      "Confirmation components must be used within a Confirmation component",
    );
  }

  return context;
};

export type ConfirmationProps = ComponentProps<typeof Alert> & {
  approval?: Approval | null;
  state?: ConfirmationState;
};

export const Confirmation = ({
  approval,
  state,
  className,
  children,
  ...props
}: ConfirmationProps) => {
  const value = useMemo(
    () => (approval ? { approval, state } : null),
    [approval, state],
  );

  if (!approval) {
    return null;
  }

  return (
    <ConfirmationContext.Provider value={value}>
      <Alert
        className={cn(
          "data-[slot=alert]:has-data-[slot=alert-title]:pl-4",
          className,
        )}
        {...props}
      >
        {children}
      </Alert>
    </ConfirmationContext.Provider>
  );
};

export type ConfirmationTitleProps = ComponentProps<typeof AlertTitle>;

export const ConfirmationTitle = ({
  className,
  children,
  ...props
}: ConfirmationTitleProps) => (
  <AlertTitle className={cn("mb-1", className)} {...props}>
    {children}
  </AlertTitle>
);

export type ConfirmationRequestProps = {
  children: ReactNode;
};

export const ConfirmationRequest = ({
  children,
}: ConfirmationRequestProps) => {
  const { state } = useConfirmation();

  if (state !== "approval-requested") {
    return null;
  }

  return <AlertDescription>{children}</AlertDescription>;
};

export type ConfirmationAcceptedProps = {
  children: ReactNode;
};

export const ConfirmationAccepted = ({
  children,
}: ConfirmationAcceptedProps) => {
  const { approval, state } = useConfirmation();

  const isAccepted =
    approval.approved &&
    (state === "approval-responded" ||
      state === "output-available" ||
      state === "output-denied");

  if (!isAccepted) {
    return null;
  }

  return (
    <AlertDescription className="flex items-center gap-2 text-foreground">
      <CheckIcon className="size-4 text-emerald-500" />
      {children}
    </AlertDescription>
  );
};

export type ConfirmationRejectedProps = {
  children: ReactNode;
};

export const ConfirmationRejected = ({
  children,
}: ConfirmationRejectedProps) => {
  const { approval, state } = useConfirmation();

  const isRejected =
    approval.approved === false &&
    (state === "approval-responded" ||
      state === "output-available" ||
      state === "output-denied");

  if (!isRejected) {
    return null;
  }

  return (
    <AlertDescription className="flex items-center gap-2 text-foreground">
      <XIcon className="size-4 text-destructive" />
      {children}
    </AlertDescription>
  );
};

export type ConfirmationActionsProps = ComponentProps<"div">;

export const ConfirmationActions = ({
  className,
  children,
  ...props
}: ConfirmationActionsProps) => {
  const { state } = useConfirmation();

  if (state !== "approval-requested") {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type ConfirmationActionProps = ComponentProps<typeof Button>;

export const ConfirmationAction = ({
  className,
  ...props
}: ConfirmationActionProps) => (
  <Button
    className={cn("h-8 px-3 text-sm", className)}
    type="button"
    {...props}
  />
);
