import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { InsightsFilters } from "../components/insights-filters";
import {
  InsightsList,
  InsightsListSkeleton,
} from "../components/insights-list";

interface AIInsightsViewProps {
  search: string;
  type: string;
  severity: string;
  dismissed: boolean;
  page: number;
  focusInsightId?: string;
}

export function AIInsightsView({
  search,
  type,
  severity,
  dismissed,
  page,
  focusInsightId,
}: AIInsightsViewProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="AI Insights"
        description="Personalized financial recommendations powered by AI"
      />

      <div className="bg-card border-muted shadow rounded-2xl p-5 space-y-4">
        <InsightsFilters
          currentSearch={search}
          currentType={type}
          currentSeverity={severity}
          currentShowDismissed={dismissed}
        />

        <SectionBoundary
          fallback={<InsightsListSkeleton />}
          errorMessage="Could not load account summary"
        >
          <InsightsList focusInsightId={focusInsightId} />
        </SectionBoundary>
      </div>
    </div>
  );
}
