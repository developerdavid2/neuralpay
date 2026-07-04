import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useDismissInsight() {
  const trpc = useTRPC();
  const { invalidateInsights } = useInvalidateQueries();

  return useMutation({
    ...trpc.ai.insights.dismiss.mutationOptions(),
    onSuccess: invalidateInsights,
  });
}
