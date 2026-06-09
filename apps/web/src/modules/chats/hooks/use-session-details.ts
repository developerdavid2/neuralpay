import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useSession(sessionId: string) {
  const trpc = useTRPC();

  const {
    data: session,
    isPending,
    isError,
  } = useQuery({
    ...trpc.ai.coach.sessionById.queryOptions({ sessionId }),
    enabled: !!sessionId,
    staleTime: 30_000,
  });

  return {
    session: session ?? null,
    isLoading: isPending,
    isError,
  };
}
