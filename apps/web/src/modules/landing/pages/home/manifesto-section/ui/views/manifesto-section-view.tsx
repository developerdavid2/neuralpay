"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import Aurora from "@neuralpay/ui/components/react-bits/aurora";
import { FlutedGlass } from "@neuralpay/ui/components/react-bits/fluted-glass";
import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";

export function ManifestoSectionView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const rawText =
    "Most banking apps just show you numbers. NeuralPay tells you what they mean — where your money is going, what's unusual, and what you can do about it.";

  const words = rawText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden flex items-center justify-center bg-landing-bg">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#151128", LANDING_THEME.popover, LANDING_THEME.card]}
          amplitude={1.9}
          blend={0.9}
          speed={0.8}
        />
      </div>

      <div className="max-w-7xl 3xl:max-w-450 4xl:max-w-500 mx-auto absolute inset-0 z-10 w-full">
        <FlutedGlass
          numOfPanes={36}
          blurAmount="120px"
          active={true}
          animationMs={250}
          className="w-full h-full py-16 "
        >
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
            {/* TERMINAL CURSOR / BRAND ACCENT BADGE */}
            <div className="flex items-center gap-2 shrink-0 pt-2">
              <span className="h-6 w-0.5 rounded-full bg-gray-400  animate-pulse" />
              <span className="text-base font-mono tracking-widest text-gray-400/90 font-semibold uppercase">
                INTELLIGENCE LAYER
              </span>
            </div>

            {/* ANIMATED MANIFESTO TEXT */}
            <motion.p
              ref={containerRef}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-5xl text-end max-w-5xl font-light leading-relaxed tracking-tight uppercase font-mono  ml-auto"
            >
              {words.map((word, idx) => {
                const isHighlight =
                  word.includes("NeuralPay") ||
                  word.includes("mean") ||
                  word.includes("unusual");

                return (
                  <motion.span
                    key={idx}
                    variants={wordVariants}
                    className={`inline-block mr-[0.28em] ${
                      isHighlight
                        ? "text-violet-300 font-rostex drop-shadow-[0_0_18px_rgba(6,182,212,0.5)]"
                        : "text-white/50"
                    }`}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.p>
          </div>
        </FlutedGlass>
      </div>
    </section>
  );
}
