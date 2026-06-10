import { Suspense } from "react";
import {
  HydrateClient,
  prefetchInfinite,
  prefetch,
  trpc,
} from "@/trpc/trpc-server";
import { ChatsView } from "@/modules/chats/ui/views/chats-view";

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

  void prefetchInfinite(
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

  void prefetch(trpc.ai.coach.usage.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading</p>}>
        <ChatsView />
      </Suspense>
    </HydrateClient>
  );
}
