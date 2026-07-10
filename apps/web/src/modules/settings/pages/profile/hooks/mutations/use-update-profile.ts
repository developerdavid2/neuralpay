"use client";

import { useInvalidateQueries } from "@/hooks/utils/use-invalidate-queries";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useUpdateProfile() {
  const trpc = useTRPC();
  const { invalidateProfile } = useInvalidateQueries();

  return useMutation({
    ...trpc.users.profile.update.mutationOptions(),
    onSuccess: () => {
      invalidateProfile();
    },
  });
}
