"use client";

import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface RotatingTextCircleProps {
  text: string;
  /** Pass any Lucide icon component, e.g., Shield, Zap, Sparkles, ArrowUpRight */
  icon: LucideIcon;
  /** Size of the icon in pixels (default: 24) */
  iconSize?: number;
  /** Optional custom class names for positioning or container overrides */
  className?: string;
}

export function RotatingTextCircle({
  text,
  icon: Icon,
  iconSize = 24,
  className = "",
}: RotatingTextCircleProps) {
  const letters = text.split("");

  return (
    <div
      className={`hidden lg:flex relative w-[140px] h-[140px] items-center justify-center select-none ${className}`}
    >
      {/* 1. Fixed Center Icon (Does not rotate) */}
      <div className="z-10 flex items-center justify-center rounded-full p-3 bg-landing-card/60 backdrop-blur-md border border-white/10 text-landing-violet-400 shadow-md">
        <Icon size={iconSize} style={{ color: LANDING_THEME.violet400 }} />
      </div>

      {/* 2. Rotating Curved Text Circle */}
      <div className="animate-spin-slow absolute inset-0 text-section-muted/80 font-mono">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 text-[10px] uppercase font-semibold tracking-widest"
            style={{
              transform: `
                translate(-50%, -50%)
                rotate(${i * (360 / letters.length)}deg)
                translateY(-56px)
              `,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
