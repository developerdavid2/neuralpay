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
    invalidateTRPCQueries(queryClient, ["payments", "transactions"]),
    invalidateTRPCQueries(queryClient, ["payments", "accounts", "list"]),
    invalidateTRPCQueries(queryClient, [
      "payments",
      "accounts",
      "aggregateByType",
    ]),
    invalidateTRPCQueries(queryClient, ["payments", "accounts", "getById"]),
  ]);
}
export async function invalidateTransactionQueries(queryClient: QueryClient) {
  await Promise.all([
    invalidateTRPCQueries(queryClient, ["payments", "transactions", "list"]),
    invalidateTRPCQueries(queryClient, ["payments", "transactions", "getById"]),
    invalidateTRPCQueries(queryClient, ["ai", "insights"]),
  ]);
}

export async function invalidateInsightsQueries(queryClient: QueryClient) {
  await invalidateTRPCQueries(queryClient, ["ai", "insights"]);
}
export async function invalidateChatQueries(queryClient: QueryClient) {
  await invalidateTRPCQueries(queryClient, ["ai", "coach", "sessions"]);
}

export async function invalidateChatSessionQueries(
  queryClient: QueryClient,
  sessionId: string,
) {
  await Promise.all([
    invalidateTRPCQueries(queryClient, [
      "ai",
      "coach",
      "sessionById",
      sessionId,
    ]),
    invalidateTRPCQueries(queryClient, ["ai", "coach", "messages", sessionId]),
  ]);
}
