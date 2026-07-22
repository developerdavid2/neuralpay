"use client";

import MagicRings from "@neuralpay/ui/components/react-bits/magic-rings";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LightRays = dynamic(
  () => import("@neuralpay/ui/components/react-bits/light-rays"),
  { ssr: false },
);

export default function HeroBackground() {
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const evaluate = () => {
      setEffectsEnabled(
        !reducedMotionQuery.matches && window.innerWidth >= 768,
      );
    };

    evaluate();
    window.addEventListener("resize", evaluate);
    reducedMotionQuery.addEventListener("change", evaluate);

    return () => {
      window.removeEventListener("resize", evaluate);
      reducedMotionQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Centered 5px Violet Line at Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-[5px] w-24 rounded-b-sm bg-violet-400 shadow-[0_0_15px_rgba(196,181,253,0.8)]" />

      {/* 2. Base Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(196,181,253,0.10) 0%, rgba(5,5,8,0) 55%), #151515",
        }}
      />

      {/* 3. Volumetric Light Ray Discs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-125 rounded-full bg-violet-500/15 blur-[130px] pointer-events-none z-1" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] md:h-[550px] md:w-[550px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none z-1" />

      {/* 4. 5 Thicker Architectural Vertical Columns Only (No Rows) */}
      <div className="absolute inset-0 z-2 mx-auto grid w-full max-w-[1440px] grid-cols-5 px-4 pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]">
        <div className="h-full border-l border-r border-white/5" />
        <div className="h-full border-r border-white/5" />
        <div className="h-full border-r border-white/5" />
        <div className="h-full border-r border-white/5" />
        <div className="h-full border-r border-white/5" />
      </div>

      {/* 5. Light Rays Effect */}
      {effectsEnabled && (
        <div className="absolute inset-0 z-3 opacity-60">
          <LightRays
            raysOrigin="top-center"
            raysColor="#C4B5FD"
            raysSpeed={0.4}
            lightSpread={1.4}
            rayLength={1.0}
            pulsating={false}
            fadeDistance={0.9}
            saturation={0.5}
            followMouse={false}
            mouseInfluence={0}
            noiseAmount={0.04}
            distortion={0}
          />
        </div>
      )}

      {/* 6. Magic Rings Background Layer */}
      <div className="absolute w-full h-full z-4 flex items-center justify-center overflow-hidden">
        <MagicRings
          color="#A684FF"
          colorTwo="#DEDFE2"
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
    </div>
  );
}
