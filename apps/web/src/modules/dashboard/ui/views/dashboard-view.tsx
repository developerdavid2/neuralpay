import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { StatCards, StatCardsSkeleton } from "../components/stat-cards";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "../components/recent-transactions";
import { InsightsSummary } from "../components/insights-summary";
import {
  SpendingChart,
  SpendingChartSkeleton,
} from "../components/spending-chart";
import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-accent">
      <DashboardHeader
        title="Dashboard"
        description="Welcome back. Here's your financial overview."
        action="Add me"
      />

      <div className="bg-background border-muted shadow rounded-2xl p-5 space-y-4">
        <SectionBoundary
          fallback={<StatCardsSkeleton />}
          errorMessage="Could not load account summary"
        >
          <StatCards />
        </SectionBoundary>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <SectionBoundary
            fallback={<SpendingChartSkeleton />}
            errorMessage="Could not load spending chart"
          >
            <SpendingChart />
          </SectionBoundary>

          <SectionBoundary
            fallback={<CardSkeleton className="h-72" />}
            errorMessage="Could not load insights"
          >
            <InsightsSummary />
          </SectionBoundary>
        </div>

        {/* Row 3 — Spending chart */}
        <SectionBoundary
          fallback={<RecentTransactionsSkeleton />}
          errorMessage="Could not load transactions"
        >
          <RecentTransactions />
        </SectionBoundary>

        <ErrorBoundary fallback>
          <Suspense fallback>
            <div>Top Categories</div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function CardSkeleton({ className = "h-48" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}
