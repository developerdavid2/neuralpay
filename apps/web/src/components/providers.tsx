"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@neuralpay/ui/components/sonner";
import { ThemeProvider } from "./theme-provider";
import { TRPCReactProvider } from "@/trpc/trpc-client";
import { useEffect } from "react";
import { NotificationInitializer } from "@/modules/notifications/ui/components/notification-initializer";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => console.log("[SW] registered:", reg.scope))
        .catch((err) => console.error("[SW] registration failed:", err));
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCReactProvider>
        <NotificationInitializer />
        {children}
        <ReactQueryDevtools />
      </TRPCReactProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
