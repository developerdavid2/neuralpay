import { DashboardHeader } from "@/components/dashboard-header";
import { SectionBoundary } from "@/components/section-boundary";
import { validateSeverity, validateType } from "../../lib/validate-filters";
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
  const validatedType = validateType(type);
  const validatedSeverity = validateSeverity(severity);

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
          key={`${type}-${severity}-${search}-${dismissed}`}
          fallback={<InsightsListSkeleton />}
          errorMessage="Could not load account summary"
        >
          <InsightsList
            focusInsightId={focusInsightId}
            currentSearch={search}
            currentType={validatedType!}
            currentSeverity={validatedSeverity!}
            currentShowDismissed={dismissed}
          />
        </SectionBoundary>
      </div>
    </div>
  );
}
