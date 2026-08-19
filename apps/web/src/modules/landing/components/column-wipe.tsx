"use client";

import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface ColumnWipeProps {
  /** Number of columns to render (default 8) */
  columns?: number;
  /** Callback fires once the wipe animation completes */
  onComplete?: () => void;
  /** Optional extra class on the wrapper */
  className?: string;
  /** Background color of the columns (default: #12101A) */
  color?: string;
}

/**
 * Reusable full‑viewport column wipe.
 *
 * Renders N full‑height columns side‑by‑side, then collapses each
 * from `scaleY(1)` to `scaleY(0)` with `transform-origin: top`,
 * staggered left‑to‑right.  Will also serve future page transitions.
 *
 * Under prefers-reduced-motion the columns simply fade out together
 * in 0.3 s with no stagger.
 */
export function ColumnWipe({
  columns = 8,
  onComplete,
  className,
  color = "#12101A",
}: ColumnWipeProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cols =
        containerRef.current?.querySelectorAll<HTMLElement>("[data-wipe-col]");
      if (!cols?.length) return;

      if (reduced) {
        gsap.to(cols, {
          opacity: 0,
          duration: 0.3,
          onComplete,
        });
        return;
      }

      // Explicit initial state: columns start fully visible (scaleY: 1)
      // with the collapse origin at the top, so there is no flash
      // of a wrong first paint before the wipe runs.
      gsap.set(cols, {
        scaleY: 1,
        transformOrigin: "top",
      });

      gsap.fromTo(
        cols,
        { scaleY: 1 },
        {
          scaleY: 0,
          duration: 1.3,
          ease: "power2.inOut",
          stagger: 0.12,
          transformOrigin: "top",
          onComplete,
        },
      );
    },
    { scope: containerRef, dependencies: [reduced, columns] },
  );

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-50 flex ${className ?? ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          data-wipe-col=""
          className="h-full flex-1 origin-top"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
