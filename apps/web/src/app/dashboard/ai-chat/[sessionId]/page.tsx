// app/ai-chat/[sessionId]/page.tsx
import { CHAT_SESSION_MESSAGES } from "@/modules/chats/constants";
import { ChatIdView } from "@/modules/chats/ui/views/chat-id-view";
import {
  HydrateClient,
  prefetch,
  prefetchInfinite,
  trpc,
} from "@/trpc/trpc-server";
import { Suspense } from "react";
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
      { sessionId, limit: CHAT_SESSION_MESSAGES },
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
