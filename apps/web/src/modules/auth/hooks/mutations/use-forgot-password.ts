"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useForgotPassword() {
  const trpc = useTRPC();
  return useMutation(trpc.users.auth.forgotPassword.mutationOptions());
}
