import { useTRPC } from "@/trpc/trpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function useSessionDetails(sessionId: string) {
  const trpc = useTRPC();

  const {
    data: session,
    isLoading: isLoadingSession,
    isError: isErrorSession,
  } = useSuspenseQuery(
    trpc.ai.coach.sessionById.queryOptions(
      { sessionId, limit: 50 },
      { enabled: !!sessionId },
    ),
  );

  return {
    session,
    isLoadingSession,
    isErrorSession,
  };
}
