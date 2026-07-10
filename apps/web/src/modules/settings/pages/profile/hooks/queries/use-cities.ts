import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useCities(
  countryIsoCode: string | undefined,
  stateIsoCode: string | undefined,
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.users.location.cities.queryOptions(
      { countryIsoCode: countryIsoCode!, stateIsoCode: stateIsoCode! },
      { enabled: !!countryIsoCode && !!stateIsoCode },
    ),
  });
}
