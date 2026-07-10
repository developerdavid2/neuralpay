import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useStates(countryIsoCode: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.users.location.states.queryOptions(
      { countryIsoCode: countryIsoCode! },
      { enabled: !!countryIsoCode },
    ),
  });
}
