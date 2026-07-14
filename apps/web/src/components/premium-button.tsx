"use client";

import * as React from "react";
import { cn } from "@neuralpay/ui/lib/utils";
import { Button } from "@neuralpay/ui/components/button";
import { Loader } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PremiumButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function PremiumButton({
  children,
  className,
  icon: Icon,
  isLoading = false,
  disabled,
  type,
  ...props
}: PremiumButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Button
      type={type}
      disabled={isDisabled}
      className={cn(
        "group relative overflow-hidden rounded-xl p-px",
        "bg-[linear-gradient(180deg,rgba(141,68,245,1)_0%,rgba(81,30,154,1)_100%)]",
        "shadow-[0px_0px_8px_rgba(141,68,245,0.15),0px_0px_24px_rgba(81,30,154,0.25)]",
        "border border-white/10 dark:border-white/5",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.015] active:scale-[0.985]",
        "disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {/* TOP MOVING LIGHT */}
      <span className="pointer-events-none absolute left-[40%] top-0 z-20 h-px w-[60%] opacity-0 transition-all duration-500 group-hover:left-4 group-hover:opacity-70 bg-linear-to-r from-transparent via-violet-200 to-transparent" />

      {/* BOTTOM MOVING LIGHT */}
      <span className="pointer-events-none absolute bottom-0 left-4 z-20 h-px w-[35%] opacity-0 transition-all duration-500 group-hover:left-[60%] group-hover:opacity-70 bg-linear-to-r from-transparent via-violet-300 to-transparent" />

      {/* INNER SURFACE */}
      <span className="relative flex min-h-15 w-full items-center justify-center overflow-hidden rounded-[15px] px-6 py-4 bg-[linear-gradient(180deg,rgba(141,68,245,1)_0%,rgba(81,30,154,1)_100%)]">
        {/* DARKER HOVER LAYER */}
        <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(180deg,rgba(20,10,40,0.08)_0%,rgba(10,5,25,0.35)_100%)]" />

        {/* TOP BEVEL */}
        <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

        {/* INNER LIGHT */}
        <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_60%)]" />

        {/* CONTENT */}
        <span className="relative z-10 flex items-center gap-3">
          {/* Spinner replaces icon when loading */}
          {isLoading ? (
            <Loader className="size-5 text-violet-100 " />
          ) : Icon ? (
            <Icon className="size-5 text-violet-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105" />
          ) : null}

          <span className="text-sm capitalize tracking-[0.03em] text-white">
            {children}
          </span>
        </span>
      </span>
    </Button>
  );
}
