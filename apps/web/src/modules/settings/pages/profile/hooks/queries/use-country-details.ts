import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useCountryDetails(isoCode: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.users.location.countryDetails.queryOptions(
      { isoCode: isoCode! },
      { enabled: !!isoCode },
    ),
  });
}
