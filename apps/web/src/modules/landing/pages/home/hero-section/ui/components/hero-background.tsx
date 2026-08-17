"use client";

import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useLandingReady } from "@/modules/landing/lib/use-landing-ready";
import MagicRings from "@neuralpay/ui/components/react-bits/magic-rings";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LightRays = dynamic(
  () => import("@neuralpay/ui/components/react-bits/light-rays"),
  { ssr: false },
);

export default function HeroBackground() {
  const reduced = useReducedMotion();
  const ready = useLandingReady((s) => s.ready);
  const [isWide, setIsWide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const evaluate = () => setIsWide(window.innerWidth >= 768);
    evaluate();
    window.addEventListener("resize", evaluate);

    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const effectsEnabled = mounted && !reduced && isWide;

  return (
    <div className="absolute inset-0 bg-section-bg z-0 overflow-hidden pointer-events-none select-none">
      {/* Decorative grid + effects fade in only after the preloader finishes,
          so the grid lines don't trickle in during the column wipe.  The
          section's own background stays put as the seamless reveal layer. */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {/*Centered 5px Violet Line at Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-1.25 w-24 rounded-b-sm bg-violet-400 shadow-[0_0_15px_rgba(196,181,253,0.8)]" />

        {effectsEnabled && (
          <>
            {/* Volumetric Light Ray Discs */}
            <div className="absolute top-[5%] left-[40%] rounded-full size-125 bg-linear-to-b from-slate-200 via-violet-300 to-transparent blur-[170px] opacity-20 z-50"></div>

            {/* Architectural Columns */}
            <div className="absolute inset-0 z-2 mx-auto grid w-full max-w-360 grid-cols-5 px-4 pointer-events-none mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]">
              <div className="h-full border-l border-r border-white/5" />
              <div className="h-full border-r border-white/5" />
              <div className="h-full border-r border-white/5" />
              <div className="h-full border-r border-white/5" />
              <div className="h-full border-r border-white/5" />
            </div>

            <div className="absolute w-full h-full z-4 flex items-center justify-center overflow-hidden">
              <MagicRings
                color={LANDING_THEME.mutedForeground}
                colorTwo={LANDING_THEME.violet600}
                ringCount={8}
                speed={1}
                attenuation={10}
                lineThickness={2}
                baseRadius={0.35}
                radiusStep={0.1}
                scaleRate={0.1}
                opacity={0.2}
                blur={0}
                noiseAmount={0.1}
                rotation={0}
                ringGap={1.5}
                fadeIn={0.7}
                fadeOut={0.5}
                followMouse={false}
                mouseInfluence={0.2}
                hoverScale={1.2}
                parallax={0.05}
                clickBurst={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
