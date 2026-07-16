"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress the React 19 false-positive script warning in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes?.(
        "Encountered a script tag while rendering React component",
      )
    ) {
      return;
    }
    originalError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
