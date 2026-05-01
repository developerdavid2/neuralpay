import type { Metadata } from "next";
import localFont from "next/font/local";

import Providers from "@/components/providers";
import "../index.css";
import { Toaster } from "@neuralpay/ui/components/sonner";

const fontNexa = localFont({
  src: [
    { path: "./fonts/Nexa-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/Nexa-Light.woff2", weight: "200", style: "normal" },
    { path: "./fonts/Nexa-Book.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Nexa-Regular.woff2", weight: "400", style: "italic" },
    { path: "./fonts/Nexa-Bold.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Nexa-Heavy.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Nexa-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/Nexa-Black.woff2", weight: "800", style: "normal" },
    { path: "./fonts/Nexa-XBold.woff2", weight: "900", style: "normal" },
    { path: "./fonts/Nexa-XBoldItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-nexa",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "neuralpay",
  description: "neuralpay",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontNexa.variable} antialiased`}>
        <Providers>
          <Toaster className="font-sans" />
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
