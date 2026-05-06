import { useTRPC } from "@/trpc/trpc-client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export function useInsights(limit = 3) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: insights } = useSuspenseQuery(
    trpc.ai.insights.list.queryOptions({ limit }),
  );

  const dismiss = useMutation(
    trpc.ai.insights.dismiss.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.ai.insights.list.queryOptions({ limit: 3 }),
        );
      },
    }),
  );

  return { insights, dismiss };
}
