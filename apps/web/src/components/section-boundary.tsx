"use client";

import { ErrorBoundary } from "react-error-boundary";
import {
  useQueryClient,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Suspense, type ReactNode, useSyncExternalStore } from "react";
import { cn } from "@neuralpay/ui/lib/utils";
import { Button } from "@neuralpay/ui/components/button";

interface SectionErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
  message?: string;
  compact?: boolean;
}

export function SectionErrorFallback({
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

// ── Only true when there's an actual network request in flight ─────────────
function useIsNetworkFetching(queryKeys: readonly unknown[][]) {
  const queryClient = useQueryClient();

  return useSyncExternalStore(
    (callback) => queryClient.getQueryCache().subscribe(callback),
    () =>
      queryKeys.some((key) => {
        const query = queryClient.getQueryCache().find({ queryKey: key });
        // fetchStatus === "fetching" means actual HTTP request, not cache check
        return query?.state.fetchStatus === "fetching";
      }),
    () => false,
  );
}

function RefetchOverlay({
  queryKeys,
  fallback,
  children,
}: {
  queryKeys: readonly unknown[][];
  fallback: ReactNode;
  children: ReactNode;
}) {
  const isNetworkFetching = useIsNetworkFetching(queryKeys);

  if (isNetworkFetching) return <>{fallback}</>;
  return <>{children}</>;
}

interface SectionBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorMessage?: string;
  compact?: boolean;
  queryKeys?: readonly unknown[][];
}

export function SectionBoundary({
  children,
  fallback,
  errorMessage,
  compact,
  queryKeys,
}: SectionBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  const content = queryKeys?.length ? (
    <RefetchOverlay queryKeys={queryKeys} fallback={fallback}>
      {children}
    </RefetchOverlay>
  ) : (
    children
  );

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
      <Suspense fallback={fallback}>{content}</Suspense>
    </ErrorBoundary>
  );
}
