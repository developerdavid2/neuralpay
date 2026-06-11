import { ChatsView } from "@/modules/chats/ui/views/chats-view";
import {
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    topic?: string;
    includeArchived?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

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
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );

  void prefetch(trpc.ai.coach.usage.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading</p>}>
        <ChatsView />
      </Suspense>
    </HydrateClient>
  );
}
