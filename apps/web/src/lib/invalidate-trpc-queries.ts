import type { QueryClient } from "@tanstack/react-query";
export function invalidateTRPCQueries(
  queryClient: QueryClient,
  routePath: string[],
) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey as unknown[];
      if (!Array.isArray(queryKey[0])) return false;
      const routeSegments = queryKey[0] as unknown[];
      return routePath.every(
        (segment, index) => routeSegments[index] === segment,
      );
    },
  });
}

// CHANGE invalidateTransactionQueries to await both:
export async function invalidateAccountsQueries(queryClient: QueryClient) {
  await Promise.all([
    invalidateTRPCQueries(queryClient, ["payments", "accounts"]),
    invalidateTRPCQueries(queryClient, ["payments", "transactions"]),
  ]);
}
export async function invalidateTransactionQueries(queryClient: QueryClient) {
  await Promise.all([
    invalidateTRPCQueries(queryClient, ["payments", "transactions"]),
    invalidateTRPCQueries(queryClient, ["ai", "insights"]),
  ]);
}

// CHANGE invalidateInsightsQueries too:
export async function invalidateInsightsQueries(queryClient: QueryClient) {
  await invalidateTRPCQueries(queryClient, ["ai", "insights"]);
}
