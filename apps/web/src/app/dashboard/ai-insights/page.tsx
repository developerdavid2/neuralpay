import { INSIGHTS_LIMIT } from "@/modules/dashboard/constants";
import {
  validateInsightSeverity,
  validateInsightType,
} from "@/modules/insights/lib/validate-insights-enums";
import { AIInsightsView } from "@/modules/insights/ui/views/ai-insights-view";

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
    readStatus?: string;
    focus?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const validatedSeverity = validateInsightSeverity(params.severity);
  const validatedType = validateInsightType(params.type);

  const listFilters = {
    includeDismissed: params.dismissed === "true",
    limit: INSIGHTS_LIMIT,
    severity: validatedSeverity,
    type: validatedType,
    readStatus: (params.readStatus ?? "all") as "all" | "read" | "unread",
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
        readStatus={params.readStatus ?? "all"}
        focusInsightId={params.focus}
      />
    </HydrateClient>
  );
}
