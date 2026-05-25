import type { QueryClient } from "@tanstack/react-query";

/**
 * Generic invalidation factory for tRPC routes.
 * Use this pattern for any tRPC route path.
 *
 * Example usage:
 * - invalidateTRPCQueries(queryClient, ["ai", "insights"])
 * - invalidateTRPCQueries(queryClient, ["ai", "coach"])
 * - invalidateTRPCQueries(queryClient, ["transaction"])
 */
export function invalidateTRPCQueries(
  queryClient: QueryClient,
  routePath: string[],
) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey as unknown[];
      // Match tRPC route structure: [[...routePath, ...], {...input}]
      if (!Array.isArray(queryKey[0])) return false;

      const routeSegments = queryKey[0] as unknown[];
      // Check if all route segments match
      return routePath.every(
        (segment, index) => routeSegments[index] === segment,
      );
    },
  });
}

/**
 * Invalidates all insights-related queries (recent, lists, details).
 * This uses predicate-based matching to work with tRPC's generated query keys.
 */
export function invalidateInsightsQueries(queryClient: QueryClient) {
  invalidateTRPCQueries(queryClient, ["ai", "insights"]);
}
export function invalidateTransactionQueries(queryClient: QueryClient) {
  invalidateTRPCQueries(queryClient, ["payments", "transactions"]);
  invalidateTRPCQueries(queryClient, ["ai", "insights"]);
}
