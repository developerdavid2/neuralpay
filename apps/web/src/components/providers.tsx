// apps/web/src/components/providers.tsx
"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@neuralpay/ui/components/sonner";
import { ThemeProvider } from "./theme-provider";
import { TRPCReactProvider } from "@/trpc/trpc-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCReactProvider>
        {children}
        <ReactQueryDevtools />
      </TRPCReactProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
