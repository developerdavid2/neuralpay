"use client";

import { useMemo } from "react";

function RadarPulseGroup() {
  return (
    <>
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/10" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/20 shadow-[0_0_2px_var(--color-landing-violet-400)]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/40 shadow-[0_0_6px_var(--color-landing-violet-400)]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400 shadow-[0_0_18px_var(--color-landing-violet-400),0_0_30px_var(--color-landing-violet-400)]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/40 shadow-[0_0_6px_var(--color-landing-violet-400)]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/20 shadow-[0_0_2px_var(--color-landing-violet-400)]" />
      <div className="h-[2.2vh] w-2 rounded-xs bg-landing-violet-400/10 blur-[1.5px]" />
    </>
  );
}

export default function HeroGridMatrix() {
  const TOTAL_CELLS = 40;
  const PULSE_CELLS = 7;
  const GAP_CELLS = 17;
  const CONTAINER_HEIGHT_CELLS = PULSE_CELLS + GAP_CELLS + PULSE_CELLS;
  const TOTAL_STEPS = TOTAL_CELLS + CONTAINER_HEIGHT_CELLS;

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

          <div
            className="absolute top-0 left-0 flex flex-col gap-[0.3rem] mix-blend-color-dodge"
            style={{
              animation: `radarGridStepWave ${col.speed} steps(${TOTAL_STEPS}, jump-end) infinite`,
              animationDelay: col.delay,
            }}
          >
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
