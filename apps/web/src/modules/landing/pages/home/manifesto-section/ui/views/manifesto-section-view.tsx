"use client";

import { AuroraBackground } from "@neuralpay/ui/components/aurora-background";
import { FlutedGlass } from "@neuralpay/ui/components/react-bits/fluted-glass";
import { LandingContainer } from "@/modules/landing/components/landing-container";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const AURORA_COLORS = [
  "var(--landing-aurora-1)",
  "var(--landing-aurora-2)",
  "var(--landing-aurora-3)",
  "var(--landing-aurora-4)",
];

export function ManifestoSectionView() {
  const reduced = useReducedMotion();
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
    <section
      data-polarity="light"
      className="relative w-full overflow-hidden h-[80vh] bg-section-bg text-section-ink"
    >
      <AuroraBackground colors={AURORA_COLORS} className="h-full!">
        <FlutedGlass
          numOfPanes={26}
          blurAmount="180px"
          active={true}
          className="flex-1 min-h-[80vh] p-8 md:p-12 overflow-hidden border border-section-border"
        >
          <LandingContainer className="relative z-10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10">
              {/* TERMINAL CURSOR / BRAND ACCENT BADGE */}
              <div className="flex items-center gap-2 shrink-0 pt-2">
                <span className="h-6 w-0.5 rounded-full bg-section-ink animate-pulse" />
                <span className="text-base font-mono tracking-widest text-section-ink font-semibold uppercase">
                  INTELLIGENCE LAYER
                </span>
              </div>

              {/* ANIMATED MANIFESTO TEXT */}
              <motion.p
                ref={containerRef}
                variants={containerVariants}
                initial={reduced ? false : "hidden"}
                animate={reduced || isInView ? "visible" : "hidden"}
                className="text-[clamp(1.4rem,3.2vw,2.75rem)] text-start md:text-end max-w-4xl font-light leading-relaxed tracking-tight uppercase font-mono ml-auto"
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
                          : "text-section-ink"
                      }`}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </motion.p>
            </div>
          </LandingContainer>
        </FlutedGlass>
      </AuroraBackground>
    </section>
  );
}
