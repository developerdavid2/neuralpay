import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export function useMessages(sessionId: string | undefined) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.ai.coach.getMessages.infiniteQueryOptions(sessionId, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 30_000,
    }),
  );
}
