"use client";

import * as React from "react";

import { cn } from "@neuralpay/ui/lib/utils";
import { Button } from "@neuralpay/ui/components/button";

import type { LucideIcon } from "lucide-react";

interface PremiumButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
}

export function PremiumButton({
  children,
  className,
  icon: Icon,
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <Button
      disabled={disabled}
      className={cn(
        // OUTER SHELL
        "group relative overflow-hidden rounded-xl p-px",

        // BRAND SURFACE
        "bg-[linear-gradient(180deg,oklch(0.58_0.22_302)_0%,oklch(0.42_0.18_302)_100%)]",

        // DEPTH
        "shadow-[0px_0px_8px_rgba(88,28,135,0.12),0px_0px_24px_rgba(168,85,247,0.18)]",

        // LIGHT MODE
        "border border-white/10",

        // DARK MODE
        "dark:border-white/5",

        // INTERACTION
        "transition-all duration-300 ease-out",
        "hover:scale-[1.015]",
        "active:scale-[0.985]",

        // DISABLED
        "disabled:pointer-events-none disabled:opacity-60",

        className,
      )}
      {...props}
    >
      {/* TOP MOVING LIGHT */}
      <span className="pointer-events-none absolute left-[40%] top-0 z-20 h-px w-[60%] opacity-0 transition-all duration-500 group-hover:left-4 group-hover:opacity-70 bg-linear-to-r from-transparent via-fuchsia-200 to-transparent" />

      {/* BOTTOM MOVING LIGHT */}
      <span className="pointer-events-none absolute bottom-0 left-4 z-20 h-px w-[35%] opacity-0 transition-all duration-500 group-hover:left-[60%] group-hover:opacity-70 bg-linear-to-r from-transparent via-violet-200 to-transparent" />

      {/* INNER SURFACE */}
      <span className="relative flex min-h-15 items-center justify-center overflow-hidden rounded-[15px] px-6 py-4 bg-[linear-gradient(180deg,oklch(0.56_0.21_302)_0%,oklch(0.40_0.16_302)_100%)]">
        {/* DARKER HOVER LAYER */}
        <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(180deg,rgba(20,10,40,0.08)_0%,rgba(10,5,25,0.35)_100%)]" />

        {/* TOP BEVEL */}
        <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

        {/* INNER LIGHT */}
        <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_60%)]" />

        {/* CONTENT */}
        <span className="relative z-10 flex items-center gap-3">
          {Icon && (
            <Icon className="size-5 text-fuchsia-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105" />
          )}

          <span className="text-sm capitalize tracking-[0.03em] text-white">
            {children}
          </span>
        </span>
      </span>
    </Button>
  );
}
