"use client";

import { cn } from "@neuralpay/ui/lib/utils";
import React, { type CSSProperties, type ReactNode, useId } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: ReactNode;
  showRadialGradient?: boolean;
  /** 2–5 blob colors */
  colors?: string[];
  mode?: "light" | "dark";
  blur?: string;
  /** base seconds per loop; each blob gets a slightly different duration */
  speed?: number;
}

type Position = Pick<CSSProperties, "top" | "bottom" | "left" | "right">;

const PATHS: Array<{ a: Position; b: Position; c: Position }> = [
  {
    a: { top: "0%", left: "0%" },
    b: { top: "60%", left: "65%" },
    c: { top: "20%", left: "30%" },
  },
  {
    a: { top: "-30%", left: "10%" },
    b: { top: "70%", left: "70%" },
    c: { top: "10%", left: "50%" },
  },
  {
    a: { bottom: "0%", left: "0%" },
    b: { bottom: "70%", left: "70%" },
    c: { bottom: "30%", left: "40%" },
  },
  {
    a: { bottom: "-30%", right: "0%" },
    b: { bottom: "10%", right: "50%" },
    c: { bottom: "50%", right: "20%" },
  },
  {
    a: { top: "10%", right: "0%" },
    b: { top: "70%", right: "60%" },
    c: { top: "30%", right: "30%" },
  },
];

const cssPos = (p: Position) =>
  Object.entries(p)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  colors = ["#a5b4fc"],
  mode = "dark",
  blur = "90px",
  speed = 10,
  style,
  ...props
}: AuroraBackgroundProps) => {
  const uid = useId().replace(/:/g, "");

  const blobs = colors.slice(0, 5).map((color, i) => ({
    color,
    path: PATHS[i % PATHS.length]!,
    name: `aurora-${uid}-${i}`,
    duration: speed + i * 2.5,
  }));

  const keyframes = blobs
    .map(
      ({ path, name }) => `
      @keyframes ${name} {
        0% { ${cssPos(path.a)} }
        50% { ${cssPos(path.b)} }
        75% { ${cssPos(path.c)} }
        100% { ${cssPos(path.a)} }
      }`,
    )
    .join("\n");

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        className,
      )}
      style={style}
      {...props}
    >
      <style>{keyframes}</style>

      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          maskImage: showRadialGradient
            ? "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)"
            : undefined,
          WebkitMaskImage: showRadialGradient
            ? "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)"
            : undefined,
        }}
      >
        {blobs.map(({ color, name, duration }, i) => (
          <div
            key={i}
            className="absolute w-[60vw] h-[60vw] rounded-[37%_29%_27%_27%/28%_25%_41%_37%]"
            style={{
              backgroundColor: color,
              filter: `blur(${blur})`,
              opacity: mode === "light" ? 0.5 : 0.6,
              mixBlendMode: mode === "light" ? "multiply" : "screen",
              animationName: name,
              animationDuration: `${duration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
