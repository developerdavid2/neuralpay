import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useMarkReadInsight() {
  const trpc = useTRPC();
  const { invalidateInsights } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.insights.markRead.mutationOptions(),
    onSuccess: invalidateInsights,
  });
}
