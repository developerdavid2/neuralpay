import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { StatCards, StatCardsSkeleton } from "../components/stat-cards";
import { RecentTransactions } from "../components/recent-transactions";
import { InsightsSummary } from "../components/insights-summary";
import { SpendingChart } from "../components/spending-chart";

function SectionError() {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      Failed to load — refresh to retry.
    </div>
  );
}

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Row 1 — Stat cards */}
      <ErrorBoundary fallback={<SectionError />}>
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>
      </ErrorBoundary>

      {/* Row 2 — Transactions + Insights */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <ErrorBoundary fallback={<SectionError />}>
          <Suspense fallback={<TableSkeleton />}>
            <RecentTransactions />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<SectionError />}>
          <Suspense fallback={<CardSkeleton />}>
            <InsightsSummary />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Row 3 — Spending chart */}
      <ErrorBoundary fallback={<SectionError />}>
        <Suspense fallback={<CardSkeleton className="h-72" />}>
          <SpendingChart />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function CardSkeleton({ className = "h-48" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}
