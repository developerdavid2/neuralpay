import { AIInsightsView } from "@/modules/insights/ui/views/ai-insights-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/trpc-server";

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
  void prefetch(trpc.ai.insights.list.queryOptions());

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
