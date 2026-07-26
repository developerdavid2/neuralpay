"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    ...trpc.users.profile.me.queryOptions(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/auth/signin");
    }
  }, [isLoading, isError, data, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
