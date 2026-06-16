import { useTRPC } from "@/trpc/trpc-client";
import type { ChatSessionsFilterInput } from "@neuralpay/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useSessions(filters?: Partial<ChatSessionsFilterInput>) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery({
    ...trpc.ai.coach.sessions.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sessions = useMemo(() => {
    const flat = query.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return flat.filter((session) => {
      if (seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    });
  }, [query.data]);

  return {
    ...query,
    sessions,
  };
}
