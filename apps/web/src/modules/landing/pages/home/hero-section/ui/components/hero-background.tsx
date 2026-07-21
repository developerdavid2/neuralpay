"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import GradualBlur from "@neuralpay/ui/components/react-bits/gradual-blur";

// LightRays pulls in the `ogl` WebGL library. Code-splitting it out with
// next/dynamic + ssr:false means that JS chunk is never fetched for
// mobile users or anyone with reduced-motion — it only downloads when
// <LightRays /> actually mounts below.
const LightRays = dynamic(
  () => import("@neuralpay/ui/components/react-bits/light-rays"),
  { ssr: false },
);

export default function HeroBackground() {
  // Effects are opt-in: disabled for reduced-motion users and on small
  // screens, where a WebGL canvas is both unnecessary and a battery cost.
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
    <div className="absolute inset-0 z-0">
      {/* Base gradient — always present. This alone is a complete,
          calm background; the rays on top are a bonus, not a dependency. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(196,181,253,0.10) 0%, rgba(5,5,8,0) 55%), #050508",
        }}
      />

      {effectsEnabled && (
        <div className="absolute inset-0 opacity-60">
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
    </div>
  );
}
