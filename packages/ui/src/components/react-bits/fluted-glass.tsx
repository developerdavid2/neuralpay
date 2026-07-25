"use client";

import React, { useState, type PropsWithChildren } from "react";

export type FlutedGlassProps = {
  /** Number of vertical ribbed glass slats */
  numOfPanes?: number;
  /** Toggles 3D pane rotation state */
  active?: boolean;
  /** Trigger 3D rotation on hover */
  activeOnHover?: boolean;
  /** Backdrop blur intensity (e.g. "12px", "20px") */
  blurAmount?: string;
  /** Transition animation duration in ms */
  animationMs?: number;
} & React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren;

export const FlutedGlass = ({
  numOfPanes = 32,
  active = true,
  activeOnHover = false,
  blurAmount = "16px",
  animationMs = 200,
  children,
  className = "",
  ...props
}: FlutedGlassProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isRotated = active || (activeOnHover && isHovered);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden ${className}`}
      {...props}
    >
      {/* ========================================================================= */}
      {/* FLUTED GLASS SLATS (Refracts whatever WebGL/Canvas is directly underneath) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 flex w-full h-full pointer-events-none">
        {Array.from({ length: numOfPanes }).map((_, i) => (
          <div
            key={`fluted-pane-${i}`}
            className="relative h-[120%] -top-[10%] flex-1 border-l border-black/5"
            style={{
              backdropFilter: `blur(${blurAmount})`,
              WebkitBackdropFilter: `blur(${blurAmount})`,
              transform: isRotated
                ? "perspective(200px) rotateY(12deg)"
                : "perspective(100px) rotateY(90deg)",
              transition: `transform ${animationMs}ms ease-in-out`,
            }}
          >
            {/* Specular Edge Highlights & Depth Shadows */}
            {/* <div className="absolute inset-y-0 left-0 w-px bg-white/10" /> */}
            <div className="absolute inset-y-0 right-0 w-px bg-black/50" />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-gray-600/4 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
