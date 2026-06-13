"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useMessages(sessionId: string, limit = 5) {
  const trpc = useTRPC();

  return useSuspenseInfiniteQuery({
    ...trpc.ai.coach.getMessages.infiniteQueryOptions(
      { sessionId, limit },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
