import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) => {
          if (query.state.status === "error") return false;
          return (
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending"
          );
        },
        shouldDehydrateMutation: () => false,
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
