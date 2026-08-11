"use client";

import { Button } from "@neuralpay/ui/components/button";
import { cn } from "@neuralpay/ui/lib/utils";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";

import { AlertCircle, RefreshCw } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SectionErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
  message?: string;
  compact?: boolean;
}

function SectionErrorFallback({
  error,
  resetErrorBoundary,
  message = "Failed to load",
  compact = false,
}: SectionErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-border text-center",
        "bg-card dark:bg-linear-to-tr dark:from-background dark:via-40% dark:to-card",
        compact ? "p-4" : "p-8",
      )}
    >
      <AlertCircle className="size-5 text-destructive" />

      <p className="text-sm font-medium">{message}</p>

      <Button
        onClick={resetErrorBoundary}
        variant="secondary"
        size="lg"
        className="inline-flex items-center gap-1.5 rounded-lg font-medium"
      >
        <RefreshCw className="size-3" />
        Try again
      </Button>
    </div>
  );
}

interface SectionBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorMessage?: string;
  compact?: boolean;
}

export function SectionBoundary({
  children,
  fallback,
  errorMessage,
  compact,
}: SectionBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <SectionErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          message={errorMessage}
          compact={compact}
        />
      )}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
