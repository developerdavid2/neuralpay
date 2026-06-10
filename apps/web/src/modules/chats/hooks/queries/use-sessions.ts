import { useTRPC } from "@/trpc/trpc-client";
import type { ChatSessionsFilterInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useSessions(filters?: Partial<ChatSessionsFilterInput>) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.ai.coach.sessions.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 30_000,
    }),
  );

  return {
    ...query,
    isLoading: query.isPending,
  };
}
