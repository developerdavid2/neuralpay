"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useSignInWithSocial() {
  const trpc = useTRPC();
  return useMutation(trpc.users.auth.signInWithSocial.mutationOptions());
}
