"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useChangePassword() {
  const trpc = useTRPC();
  return useMutation(trpc.users.security.changePassword.mutationOptions());
}
