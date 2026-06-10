import { Suspense } from "react";
import {
  HydrateClient,
  prefetchInfinite,
  prefetch,
  trpc,
} from "@/trpc/trpc-server";

interface PageProps {
  searchParams: Promise<{
    session?: string;
    search?: string;
    topic?: string;
    includeArchived?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const sessionId = params.session;

  // Prefetch session list (infinite)
  const data = prefetchInfinite(
    trpc.ai.coach.sessions.infiniteQueryOptions(
      {
        search: params.search ?? undefined,
        topic:
          (params.topic as
            | "budgeting"
            | "spending"
            | "savings"
            | "general"
            | undefined) ?? undefined,
        includeArchived: params.includeArchived === "true",
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
  );

  // Prefetch specific session if provided
  if (sessionId) {
    void prefetch(
      trpc.ai.coach.sessionById.queryOptions({
        sessionId,
        limit: 50,
      }),
    );
  }

  // Prefetch usage (quota)
  void prefetch(trpc.ai.coach.usage.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading</p>}>
        <p>{JSON.stringify(data, null, 2)}</p>
      </Suspense>
    </HydrateClient>
  );
}
