"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId?: string;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery({
    ...trpc.users.profile.me.queryOptions(),
    retry: false,
    staleTime: 30_000,
    gcTime: 0,
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!data,
        isLoading,
        userId: data?.id,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
