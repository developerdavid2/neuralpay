import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import {
  validateInsightReadStatus,
  validateInsightSeverity,
  validateInsightType,
} from "../../lib/validate-insights-enums";
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
  readStatus: string;
  focusInsightId?: string;
}

export function AIInsightsView({
  search,
  type,
  severity,
  dismissed,
  readStatus,
  focusInsightId,
}: AIInsightsViewProps) {
  const validatedType = validateInsightType(type);
  const validatedSeverity = validateInsightSeverity(severity);
  const validatedReadStatus = validateInsightReadStatus(readStatus);

  return (
    <div className="flex flex-col gap-6 p-10">
      <DashboardHeader
        title="AI Insights"
        description="Personalized financial recommendations powered by AI"
      />

      <div className="bg-card border-muted shadow rounded-2xl p-5 space-y-4">
        <InsightsFilters />

        <SectionBoundary
          key={`${type}-${severity}-${search}-${dismissed}-${readStatus}`}
          fallback={<InsightsListSkeleton />}
          errorMessage="Could not load account summary"
        >
          <InsightsList
            focusInsightId={focusInsightId}
            currentSearch={search}
            currentType={validatedType!}
            currentSeverity={validatedSeverity!}
            currentShowDismissed={dismissed}
            currentReadStatus={validatedReadStatus}
          />
        </SectionBoundary>
      </div>
    </div>
  );
}
