"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AlreadyAuthGuard({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    ...trpc.users.profile.me.queryOptions(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!isLoading && data) {
      router.replace("/dashboard");
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
