"use client";

import { NeuralPayLogo } from "@/components/logo";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLandingReady } from "../lib/use-landing-ready";

gsap.registerPlugin(CustomEase);

CustomEase.create("hop", "0.8, 0, 0.2, 1");
CustomEase.create("glide", "0.8, 0, 0.2, 1");

interface PreloaderProps {
  onComplete?: () => void;
  onReveal?: () => void;
}

const STOPS = [0.12, 0.24, 0.35, 0.48, 0.6, 0.72, 0.85, 1];
const SEGMENT = 0.75;
const START_DELAY = 1.0;
const jitter = () => (Math.random() - 0.5) * 0.04;

export default function Preloader({ onComplete, onReveal }: PreloaderProps) {
  const reduced = useReducedMotion();

  // Only 1 ref needed!
  const rootRef = useRef<HTMLDivElement>(null);

  const [hidden, setHidden] = useState(false);
  const [columnCount, setColumnCount] = useState(8);

  useEffect(() => {
    const updateColumns = () => {
      setColumnCount(window.innerWidth < 640 ? 4 : 8);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const handleDone = useCallback(() => {
    useLandingReady.getState().setReady();
    setHidden(true);
    onComplete?.();
  }, [onComplete]);

  useGSAP(
    (_, contextSafe) => {
      if (hidden) return;

      // Scoped GSAP Selector Utility bound to rootRef
      const q = gsap.utils.selector(rootRef);

      const colsA = q("[data-layer-a] [data-wipe-col]");
      const colsB = q("[data-layer-b] [data-wipe-col]");

      if (reduced) {
        const tl = gsap.timeline({ onComplete: handleDone });
        tl.call(() => onReveal?.());
        tl.to(q("[data-preloader-content]"), { opacity: 0, duration: 0.3 });
        return;
      }

      const tl = gsap.timeline({ onComplete: handleDone });

      // ── Initial states
      gsap.set(q("[data-logo-bright], [data-word-bright]"), {
        clipPath: "inset(0 100% 0 0)",
      });

      if (colsA.length) gsap.set(colsA, { clipPath: "inset(0% 0 0% 0)" });
      if (colsB.length) gsap.set(colsB, { clipPath: "inset(0% 0 0% 0)" });

      // ── Entrance
      tl.to(q("[data-logo-dim]"), {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
      tl.to(
        q("[data-word-dim]"),
        { opacity: 1, duration: 0.4, ease: "power2.out" },
        "<",
      );
      tl.to(q("[data-preloader-content]"), { opacity: 1, duration: 0.01 }, "<");

      const values = STOPS.map((s, i) =>
        i === STOPS.length - 1 ? s : Math.min(1, Math.max(0, s + jitter())),
      );
      const half = Math.ceil(values.length / 2);
      const counter = { value: 0 };
      const counterEl = q<HTMLSpanElement>("[data-counter]")[0];

      values.forEach((val, i) => {
        const label = `stop${i}`;
        const pos = i === 0 ? START_DELAY : `stop${i - 1}+=${SEGMENT}`;
        tl.add(label, pos);

        const remaining = (1 - val) * 100;

        if (i < half) {
          const logoProgress = (i + 1) / half;
          tl.to(
            q("[data-logo-bright]"),
            {
              clipPath: `inset(0 ${(1 - logoProgress) * 100}% 0 0)`,
              duration: SEGMENT,
              ease: "glide",
            },
            label,
          );
        } else {
          const wordProgress = (i - half + 1) / (values.length - half);
          tl.to(
            q("[data-word-bright]"),
            {
              clipPath: `inset(0 ${(1 - wordProgress) * 100}% 0 0)`,
              duration: SEGMENT,
              ease: "glide",
            },
            label,
          );
        }

        tl.to(
          counter,
          {
            value: val * 100,
            duration: SEGMENT,
            ease: "glide",
            onUpdate: () => {
              if (counterEl) {
                counterEl.textContent = Math.round(counter.value)
                  .toString()
                  .padStart(3, "0");
              }
            },
          },
          label,
        );

        tl.to(
          q("[data-svg-fill]"),
          {
            attr: { "stroke-dashoffset": remaining },
            duration: SEGMENT,
            ease: "glide",
          },
          label,
        );
      });

      // ── Exit Sequence
      tl.to(
        q("[data-preloader-content]"),
        { y: "-100%", duration: 0.8, ease: "hop" },
        ">+=0.3",
      );
      tl.to(
        q("[data-counter]"),
        { y: "-100%", duration: 0.8, ease: "hop" },
        "<-=0.2",
      );
      tl.to(
        q("[data-svg-fill]"),
        { opacity: 0, duration: 0.3, ease: "power2.out" },
        "<",
      );

      // Layer A wipes down
      if (colsA.length) {
        tl.to(
          colsA,
          {
            clipPath: "inset(100% 0 0% 0)",
            duration: 0.8,
            ease: "hop",
            stagger: 0.05,
          },
          ">+=0.4",
        );
      }

      tl.call(() => onReveal?.(), undefined, ">");

      // Layer B wipes down
      if (colsB.length) {
        tl.to(
          colsB,
          {
            clipPath: "inset(100% 0 0% 0)",
            duration: 0.8,
            ease: "hop",
            stagger: 0.05,
          },
          "+=0.1",
        );
      }
    },
    { scope: rootRef, dependencies: [reduced, hidden, columnCount] },
  );

  if (hidden) return null;

  return (
    <section
      ref={rootRef}
      className="pointer-events-none fixed inset-0 min-h-svh z-90 flex flex-col items-center justify-center overflow-hidden"
      aria-label="Loading"
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Layer A — Front layer */}
      <div
        data-layer-a
        className="absolute inset-0 z-10 flex w-full h-full pointer-events-none"
      >
        {Array.from({ length: columnCount }).map((_, i) => (
          <div
            key={i}
            data-wipe-col=""
            className="h-full flex-1 bg-landing-bg scale-x-[1.01] -mr-px will-change-[clip-path]"
          />
        ))}
      </div>

      {/* Layer B — Accent transition layer */}
      <div
        data-layer-b
        className="absolute inset-0 z-0 flex w-full h-full pointer-events-none"
      >
        {Array.from({ length: columnCount }).map((_, i) => (
          <div
            key={i}
            data-wipe-col=""
            className="h-full flex-1 bg-landing-bg-light scale-x-[1.01] -mr-px will-change-[clip-path]"
          />
        ))}

        <div className="absolute top-1/2 left-1/2">
          <NeuralPayLogo
            size={78}
            showText={false}
            src="https://eqr61bekec.ufs.sh/f/sH4weU3V69zXXnnMPIifkPbws3hnSHtBAq6jeKT2Fr7GvEda"
          />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-20 overflow-hidden px-4">
        <div
          data-preloader-content
          className="flex items-center justify-center gap-3 sm:gap-5 md:gap-6 opacity-0"
        >
          {/* Logo Container with Dynamic Width & Height */}
          <div className="relative size-12 sm:size-18 shrink-0">
            <div
              data-logo-dim
              className="absolute inset-0 opacity-100 grayscale brightness-50"
            >
              <NeuralPayLogo
                showText={false}
                fill
                className="w-full h-full p-0"
                imageClassName="object-contain"
              />
            </div>
            <div data-logo-bright className="absolute inset-0">
              <NeuralPayLogo
                showText={false}
                fill
                className="w-full h-full p-0"
                imageClassName="object-contain"
              />
            </div>
          </div>

          {/* Text Container */}
          <div className="relative">
            <h4
              data-word-dim
              className="text-[clamp(1.75rem,5vw,3.5rem)] font-semibold font-rostex tracking-tight text-[#6b6b6b] leading-none"
              aria-hidden="true"
            >
              NeuralPay
            </h4>
            <h4
              data-word-bright
              className="absolute inset-0 text-[clamp(1.75rem,5vw,3.5rem)] font-semibold font-rostex tracking-tight text-landing-fg-light leading-none"
            >
              NeuralPay
            </h4>
          </div>
        </div>
      </div>

      {/* Counter Container */}
      <div className="overflow-hidden absolute bottom-[3%] left-[4%] sm:left-[3%] z-20">
        <span
          data-counter
          className="block font-mono text-[clamp(1.5rem,4vw,3rem)] tabular-nums text-landing-fg-light/80 leading-none"
        >
          000
        </span>
      </div>

      {/* Progress Line */}
      <svg
        className="absolute inset-x-0 bottom-[1%] h-1 w-full z-20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <line
          data-svg-fill
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="100"
        />
      </svg>
    </section>
  );
}
