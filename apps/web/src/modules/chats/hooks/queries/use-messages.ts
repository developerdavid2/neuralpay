"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useMessages(sessionId: string) {
  const trpc = useTRPC();

  return useSuspenseInfiniteQuery(
    trpc.ai.coach.getMessages.infiniteQueryOptions(
      { sessionId, limit: 30 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 30_000,
      },
    ),
  );
}
