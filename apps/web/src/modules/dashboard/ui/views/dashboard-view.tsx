import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { Suspense } from "react";
import {
  InsightsSummary,
  InsightsSummarySkeleton,
} from "../components/insights-summary";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "../components/recent-transactions";
import {
  SpendingChart,
  SpendingChartSkeleton,
} from "../components/spending-chart";
import { StatCards, StatCardsSkeleton } from "../components/stat-cards";
import {
  TopCategoriesCard,
  TopCategoriesSkeleton,
} from "../components/top-monthly-categories";

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
            fallback={<InsightsSummarySkeleton />}
            errorMessage="Could not load insights"
          >
            <InsightsSummary />
          </SectionBoundary>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <SectionBoundary
            fallback={<RecentTransactionsSkeleton />}
            errorMessage="Could not load transactions"
          >
            <RecentTransactions />
          </SectionBoundary>

          <SectionBoundary
            fallback={<TopCategoriesSkeleton />}
            errorMessage="Could not load categories"
          >
            <TopCategoriesCard />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
}
