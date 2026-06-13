import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSessionDetails(sessionId: string) {
  const trpc = useTRPC();

  const { data: sessionData } = useSuspenseQuery(
    trpc.ai.coach.sessionById.queryOptions({ sessionId, limit: 50 }),
  );

  return { sessionData };
}
