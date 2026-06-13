// app/ai-chat/[sessionId]/page.tsx
import { Suspense } from "react";
import {
  HydrateClient,
  prefetchInfinite,
  prefetch,
  trpc,
} from "@/trpc/trpc-server";
import { ChatIdView } from "@/modules/chats/ui/views/chat-id-view";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ initialMessage?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { initialMessage } = await searchParams;

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
          <ChatIdView sessionId={sessionId} initialMessage={initialMessage} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
