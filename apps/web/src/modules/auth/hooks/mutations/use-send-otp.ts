"use client";
import { useTRPC } from "@/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";

export function useSendOtp() {
  const trpc = useTRPC();
  return useMutation(trpc.users.auth.sendOtp.mutationOptions());
}
