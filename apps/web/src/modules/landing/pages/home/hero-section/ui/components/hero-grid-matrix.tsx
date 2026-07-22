"use client";

import { useMemo } from "react";

function RadarPulseGroup() {
  return (
    <>
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/10" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/20 shadow-[0_0_2px_#C4B5FD]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/40 shadow-[0_0_6px_#C4B5FD]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD] shadow-[0_0_18px_#C4B5FD,0_0_30px_#C4B5FD]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/40 shadow-[0_0_6px_#C4B5FD]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/20 shadow-[0_0_2px_#C4B5FD]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-[#C4B5FD]/10 blur-[1.5px]" />
    </>
  );
}

export default function HeroGridMatrix() {
  const TOTAL_CELLS = 40;
  const PULSE_CELLS = 7;
  const GAP_CELLS = 17;
  const CONTAINER_HEIGHT_CELLS = PULSE_CELLS + GAP_CELLS + PULSE_CELLS;
  const TOTAL_STEPS = TOTAL_CELLS + CONTAINER_HEIGHT_CELLS;

  // Position: fast, quantized. Fade: slow, smooth, on its own clock.
  const columns = useMemo(
    () => [
      {
        left: "left-[10vw]",
        speed: "10s",
        delay: "-2s",
        fade: "2.5s",
        fadeDelay: "-0.4s",
      },
      {
        left: "left-[38vw]",
        speed: "12s",
        delay: "-6s",
        fade: "2.8s",
        fadeDelay: "-1.2s",
      },
      {
        left: "right-[38vw]",
        speed: "11s",
        delay: "-4s",
        fade: "2.6s",
        fadeDelay: "-0.8s",
      },
      {
        left: "right-[10vw]",
        speed: "13s",
        delay: "-1s",
        fade: "3s",
        fadeDelay: "-1.6s",
      },
    ],
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <style jsx>{`
        @keyframes radarGridStepWave {
          0% {
            transform: translateY(
              calc(-${CONTAINER_HEIGHT_CELLS} * (2.2vh + 0.3rem))
            );
          }
          100% {
            transform: translateY(calc(${TOTAL_CELLS} * (2.2vh + 0.3rem)));
          }
        }

        /* Smooth, non-quantized breathing — deliberately NOT steps() */
        @keyframes pulseBreathe {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className={`absolute top-0 bottom-0 flex flex-col gap-[0.3rem] ${col.left}`}
        >
          {Array.from({ length: TOTAL_CELLS }).map((_, cellIdx) => (
            <div key={cellIdx} />
          ))}

          {/* Position container — hard quantized steps, fast pace */}
          <div
            className="absolute top-0 left-0 flex flex-col gap-[0.3rem] mix-blend-color-dodge"
            style={{
              animation: `radarGridStepWave ${col.speed} steps(${TOTAL_STEPS}, jump-end) infinite`,
              animationDelay: col.delay,
            }}
          >
            {/* Each pulse group gets its own independent, smooth
                opacity breathing loop — this is what fades it in
                and out without touching the quantized movement */}
            <div
              className="flex flex-col gap-[0.3rem]"
              style={{
                animation: `pulseBreathe ${col.fade} ease-in-out infinite`,
                animationDelay: col.fadeDelay,
              }}
            >
              <RadarPulseGroup />
            </div>

            {Array.from({ length: GAP_CELLS }).map((_, idx) => (
              <div key={idx} className="h-[2.2vh] w-2" />
            ))}

            <div
              className="flex flex-col gap-[0.3rem]"
              style={{
                animation: `pulseBreathe ${col.fade} ease-in-out infinite`,
                animationDelay: col.fadeDelay,
              }}
            >
              <RadarPulseGroup />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
