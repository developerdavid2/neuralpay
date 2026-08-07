import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useInsightDetail(insightId: string) {
	const trpc = useTRPC();
	const {
		data: insight,
		isPending,
		isError,
	} = useQuery({
		...trpc.ai.insights.getInsightById.queryOptions({ id: insightId }),
		enabled: !!insightId,
	});

	return {
		insight: insight ?? null,
		isLoading: isPending,
		isError,
	};
}
