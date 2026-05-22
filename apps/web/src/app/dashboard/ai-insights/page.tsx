import { INSIGHTS_LIMIT } from "@/modules/dashboard/constants";
import { AIInsightsView } from "@/modules/insights/ui/views/ai-insights-view";
import {
  validateSeverity,
  validateType,
} from "@/modules/insights/lib/validate-filters";
import {
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    severity?: string;
    dismissed?: string;
    page?: string;
    focus?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const validatedSeverity = validateSeverity(params.severity);
  const validatedType = validateType(params.type);

  const listFilters = {
    includeDismissed: params.dismissed === "true",
    limit: INSIGHTS_LIMIT,
    severity: validatedSeverity,
    type: validatedType,
    search: params.search ?? "",
  };

  void prefetchInfinite(
    trpc.ai.insights.list.infiniteQueryOptions(listFilters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  if (params.focus) {
    void prefetch(
      trpc.ai.insights.getInsightById.queryOptions({ id: params.focus }),
    );
  }

  return (
    <HydrateClient>
      <AIInsightsView
        search={params.search ?? ""}
        type={params.type ?? "all"}
        severity={params.severity ?? "all"}
        dismissed={params.dismissed === "true"}
        page={Math.max(1, parseInt(params.page ?? "1", 10) || 1)}
        focusInsightId={params.focus}
      />
    </HydrateClient>
  );
}
