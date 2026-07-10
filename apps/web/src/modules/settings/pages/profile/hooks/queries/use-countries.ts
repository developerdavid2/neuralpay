"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function useCountries() {
  const trpc = useTRPC();
  return useQuery(trpc.users.location.countries.queryOptions());
}
