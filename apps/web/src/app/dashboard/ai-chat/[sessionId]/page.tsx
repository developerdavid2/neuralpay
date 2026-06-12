import { Suspense } from "react";
import {
  HydrateClient,
  prefetchInfinite,
  prefetch,
  trpc,
} from "@/trpc/trpc-server";
import { ChatSessionView } from "@/modules/chats/ui/views/chat-session-view";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;

  void prefetch(
    trpc.ai.coach.sessionById.queryOptions({ sessionId, limit: 50 }),
  );

  void prefetchInfinite(
    trpc.ai.coach.getMessages.infiniteQueryOptions(
      { sessionId, limit: 30 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading conversation…</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <ChatSessionView sessionId={sessionId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
