"use client";

import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useLandingReady } from "@/modules/landing/lib/use-landing-ready";

import Orb from "@neuralpay/ui/components/react-bits/orb";
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

    const evaluate = () => {
      setIsWide(window.innerWidth >= 768);
    };

    evaluate();

    window.addEventListener("resize", evaluate);

    return () => {
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  const effectsEnabled = mounted && !reduced && isWide;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-landing-border-subtle-light pointer-events-none select-none">
      {/* =========================================================
          BASE ATMOSPHERE
          ========================================================= */}

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 48% at 50% 48%,
              rgba(65, 57, 130, 0.14) 0%,
              rgba(31, 27, 67, 0.08) 32%,
              rgba(9, 10, 16, 0) 72%
            )
          `,
        }}
      />

      {/* Extremely subtle vertical architectural illumination */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.018) 49.8%,
              rgba(255,255,255,0.028) 50%,
              rgba(255,255,255,0.018) 50.2%,
              transparent 100%
            )
          `,
        }}
      />

      {/* =========================================================
          FADE-IN CONTAINER
          ========================================================= */}

      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          opacity: ready ? 1 : 0,
        }}
      >
        {effectsEnabled && (
          <>
            {/* =====================================================
                ARCHITECTURAL GRID
                ===================================================== */}

            <div
              className="
                absolute
                inset-0
                z-1
                mx-auto
                grid
                w-full
                max-w-360
                grid-cols-5
                px-4
                opacity-[0.32]
              "
              style={{
                maskImage:
                  "radial-gradient(ellipse 72% 72% at 50% 50%, black 38%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 72% at 50% 50%, black 38%, transparent 100%)",
              }}
            >
              <div className="h-full border-l border-r border-white/[0.045]" />
              <div className="h-full border-r border-white/[0.045]" />
              <div className="h-full border-r border-white/[0.045]" />
              <div className="h-full border-r border-white/[0.045]" />
              <div className="h-full border-r border-white/[0.045]" />
            </div>

            {/* Horizontal engineering axis */}
            <div
              className="
                absolute
                left-0
                right-0
                top-1/2
                z-[2]
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/[0.08]
                to-transparent
              "
            />

            {/* Vertical engineering axis */}
            <div
              className="
                absolute
                bottom-0
                left-1/2
                top-0
                z-[2]
                w-px
                -translate-x-1/2
                bg-gradient-to-b
                from-transparent
                via-white/[0.045]
                to-transparent
              "
            />

            {/* =====================================================
                LARGE GEOMETRIC FRAME
                ===================================================== */}

            <div className="absolute inset-0 z-[2] flex items-center justify-center">
              <div
                className="
                  relative
                  aspect-square
                  w-[min(72vw,780px)]
                  rotate-45
                  border
                  border-violet-300/[0.055]
                "
              >
                <div className="absolute inset-[14%] border border-white/[0.035]" />

                <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] border border-violet-200/30" />

                <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-[-45deg] border border-violet-200/20" />

                <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] border border-violet-200/20" />

                <div className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rotate-[-45deg] border border-violet-200/20" />
              </div>
            </div>

            {/* =====================================================
                SUBTLE ROTATING LIGHT RINGS
                ===================================================== */}

            <div className="absolute inset-0 z-[3] flex items-center justify-center">
              <div
                className="
                  absolute
                  aspect-square
                  w-[min(48vw,520px)]
                  rounded-full
                  border
                  border-violet-200/[0.045]
                "
              />

              <div
                className="
                  absolute
                  aspect-square
                  w-[min(58vw,620px)]
                  rounded-full
                  border
                  border-white/2.5
                "
              />

              <div
                className="
                  absolute
                  aspect-square
                  w-[min(68vw,720px)]
                  rounded-full
                  border
                  border-violet-300/2.5
                "
              />
            </div>

            {/* =====================================================
                BROKEN / DASHED ORBITAL GEOMETRY
                ===================================================== */}

            <div className="absolute inset-0 z-[4] flex items-center justify-center">
              <div
                className="
                  absolute
                  aspect-square
                  w-[min(46vw,500px)]
                  rounded-full
                  border
                  border-dashed
                  border-violet-200/[0.10]
                  [transform:rotate(-18deg)]
                "
                style={{
                  borderSpacing: "12px",
                }}
              />

              <div
                className="
                  absolute
                  aspect-square
                  w-[min(54vw,590px)]
                  rounded-full
                  border
                  border-dashed
                  border-white/[0.045]
                  rotate-[27deg]
                "
              />

              {/* orbital ticks */}
              <div className="absolute h-[min(54vw,590px)] w-[min(54vw,590px)] animate-[spin_28s_linear_infinite] rounded-full">
                <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-violet-200/25" />
                <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-white/15" />
                <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-violet-200/20" />
                <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-violet-200/20" />
              </div>
            </div>

            {/* =====================================================
                LOCALIZED SPOTLIGHT / LIGHT RAY
                ===================================================== */}

            <div className="pointer-events-none absolute inset-0 z-20 overflow-visible opacity-10 dark:opacity-70">
              <LightRays
                raysOrigin="top-center"
                raysColor="#B9B1FF"
                raysSpeed={0.22}
                lightSpread={1.8}
                rayLength={0.5}
                pulsating={false}
                fadeDistance={1.25}
                saturation={0.42}
                followMouse={true}
                mouseInfluence={0}
                noiseAmount={0}
                distortion={0.02}
              />
            </div>
            <div className="absolute inset-0 z-[5] overflow-hidden">
              <LightRays
                raysOrigin="top-right"
                raysColor="#B9B1FF"
                raysSpeed={0.22}
                lightSpread={1.8}
                rayLength={1.35}
                pulsating={false}
                fadeDistance={1.25}
                saturation={0.42}
                followMouse={false}
                mouseInfluence={0}
                noiseAmount={0}
                distortion={0.02}
              />
            </div>

            {/* =====================================================
                PHYSICAL LIGHT DISPERSION BESIDE ORB
                ===================================================== */}

            <div
              className="
                absolute
                left-[58%]
                top-[37%]
                z-[6]
                h-[260px]
                w-[180px]
                -translate-x-1/2
                -translate-y-1/2
                rotate-[28deg]
                rounded-full
                opacity-[0.13]
                blur-[70px]
              "
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(137,125,255,0.65), rgba(245,243,255,0.32), transparent)",
              }}
            />

            {/* Narrower physical beam */}
            <div
              className="
                absolute
                left-[55%]
                top-[40%]
                z-[7]
                h-[330px]
                w-[34px]
                -translate-x-1/2
                -translate-y-1/2
                rotate-[28deg]
                opacity-[0.07]
                blur-[20px]
              "
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(185,177,255,0.9), transparent)",
              }}
            />

            {/* =====================================================
                ORB
                ===================================================== */}

            <div
              className="
                absolute
                left-1/2
                top-1/2
                z-[10]
                aspect-square
                w-[min(30vw,360px)]
                -translate-x-1/2
                -translate-y-1/2
              "
            >
              {/* restrained ambient halo */}
              <div
                className="
                  absolute
                  inset-[-18%]
                  rounded-full
                  bg-violet-500/[0.055]
                  blur-[55px]
                "
              />

              <Orb
                hue={0}
                hoverIntensity={0.12}
                rotateOnHover={true}
                forceHoverState={false}
                backgroundColor="#0B0B13"
              />
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

            {/* =====================================================
                ORBITAL POINTS
                ===================================================== */}

            <div className="absolute inset-0 z-[11]">
              <span
                className="
                  absolute
                  left-1/2
                  top-[calc(50%-min(27vw,295px))]
                  h-1
                  w-1
                  -translate-x-1/2
                  rounded-full
                  bg-violet-100/70
                  shadow-[0_0_10px_rgba(180,170,255,0.45)]
                "
              />

              <span
                className="
                  absolute
                  left-[calc(50%+min(27vw,295px))]
                  top-1/2
                  h-1
                  w-1
                  -translate-y-1/2
                  rounded-full
                  bg-white/45
                "
              />

              <span
                className="
                  absolute
                  bottom-[calc(50%-min(27vw,295px))]
                  left-1/2
                  h-1
                  w-1
                  -translate-x-1/2
                  rounded-full
                  bg-violet-200/40
                "
              />
            </div>

            {/* =====================================================
                VERY SUBTLE CENTER GLOW
                ===================================================== */}

            <div
              className="
                absolute
                left-1/2
                top-1/2
                z-[8]
                h-[420px]
                w-[420px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                opacity-[0.07]
                blur-[100px]
              "
              style={{
                background:
                  "radial-gradient(circle, rgba(111,101,217,0.9) 0%, rgba(111,101,217,0.25) 32%, transparent 70%)",
              }}
            />
          </>
        )}

        {/* =========================================================
            EDGE VIGNETTE
            ========================================================= */}

        <div
          className="absolute inset-0 z-[20]"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 65% at 50% 48%,
                transparent 30%,
                rgba(5,6,10,0.16) 62%,
                rgba(5,6,10,0.68) 100%
              )
            `,
          }}
        />

        {/* =========================================================
            TOP ACCENT
            ========================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-0
            z-[30]
            h-1
            w-24
            -translate-x-1/2
            rounded-b-sm
            bg-violet-300/60
            shadow-[0_0_14px_rgba(167,154,255,0.22)]
          "
        />
      </div>
    </div>
  );
}
