"use client";

import { useMemo } from "react";

// Reusable 7-Cell Bell-Curve Pulse Group
function BellCurveGroup() {
  return (
    <>
      {/* Cell 1: Top Edge (15% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/15" />

      {/* Cell 2: Mid-Low (40% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/40 shadow-[0_0_8px_#C4B5FD]" />

      {/* Cell 3: Mid-High (75% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/75 shadow-[0_0_12px_#C4B5FD]" />

      {/* Cell 4: CENTER MEDIAN (100% Peak Brightness + Intense Glow) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD] shadow-[0_0_20px_#C4B5FD,0_0_35px_#C4B5FD]" />

      {/* Cell 5: Mid-High (75% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/75 shadow-[0_0_12px_#C4B5FD]" />

      {/* Cell 6: Mid-Low (40% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/40 shadow-[0_0_8px_#C4B5FD]" />

      {/* Cell 7: Bottom Edge (15% Opacity) */}
      <div className="h-[3.3vh] w-2 rounded-xs bg-[#C4B5FD]/15" />
    </>
  );
}

export default function HeroGridMatrix() {
  const TOTAL_CELLS = 36; // 36 static track cells
  const WAVE_CELLS = 7; // Height of 1 pulse
  const GAP_CELLS = 14; // Distance between 1st & 2nd pulse
  const CONTAINER_HEIGHT_CELLS = WAVE_CELLS + GAP_CELLS + WAVE_CELLS; // 28 cells
  const TOTAL_STEPS = TOTAL_CELLS + CONTAINER_HEIGHT_CELLS; // 64 quantized steps

  const columns = useMemo(
    () => [
      { left: "left-[10vw]", speed: "9s", delay: "-5s" },
      { left: "left-[38vw]", speed: "15s", delay: "-14s" },
      { left: "right-[38vw]", speed: "13s", delay: "-15s" },
      { left: "right-[10vw]", speed: "15s", delay: "-4s" },
    ],
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Step Jumps Keyframe */}
      <style jsx>{`
        @keyframes dualPulseStepWave {
          0% {
            /* Start completely above the static track */
            transform: translateY(
              calc(-${CONTAINER_HEIGHT_CELLS} * (3.3vh + 0.3rem))
            );
          }
          100% {
            /* Travel down through all 36 static cells */
            transform: translateY(calc(${TOTAL_CELLS} * (3.3vh + 0.3rem)));
          }
        }
      `}</style>

      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className={`absolute top-0 bottom-0 flex flex-col gap-[0.3rem] ${col.left}`}
        >
          {/* 1. Static Grid Track Frame (36 Base Cells) */}
          {Array.from({ length: TOTAL_CELLS }).map((_, cellIdx) => (
            <div key={cellIdx} className="h-[3.3vh] w-2 rounded-xs" />
          ))}

          {/* 2. Quantized Moving Overlay Container (Houses Both Pulses) */}
          <div
            className="absolute top-0 left-0 flex flex-col gap-[0.3rem] mix-blend-color-dodge"
            style={{
              /* steps(64) forces discrete cell-by-cell jumps for the entire dual-wave group */
              animation: `dualPulseStepWave ${col.speed} steps(${TOTAL_STEPS}, jump-end) infinite`,
              animationDelay: col.delay,
            }}
          >
            {/* PULSE GROUP 1 (7 Cells) */}
            <BellCurveGroup />

            {/* SPACER GAP (14 Transparent Cells) */}
            {Array.from({ length: GAP_CELLS }).map((_, idx) => (
              <div key={idx} className="h-[3.3vh] w-2" />
            ))}

            {/* PULSE GROUP 2 (7 Cells) */}
            <BellCurveGroup />
          </div>
        </div>
      ))}
    </div>
  );
}
