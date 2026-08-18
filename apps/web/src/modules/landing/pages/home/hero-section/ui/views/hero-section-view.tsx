"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import { PremiumButton } from "@/components/premium-button";
import { RotatingTextCircle } from "@/components/rotating-text-circle";
import { LandingContainer } from "@/modules/landing/components/landing-container";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useLandingReady } from "@/modules/landing/lib/use-landing-ready";
import HeroBackground from "../components/hero-background";
import { HeroMiniChart } from "../components/hero-mini-chart";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2 * i,
    },
  }),
};

const blurWordVariants = {
  hidden: {
    filter: "blur(12px)",
    opacity: 0,
    y: 12,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
};

export default function HeroSectionView() {
  const reduced = useReducedMotion();
  const ready = useLandingReady((s) => s.ready);
  const subtitleText = "Understand your money with effortless clarity.";
  const paragraphText =
    "NeuralPay connects to your bank accounts, explains your spending in plain English, and automates peer bill splits.";

  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <HeroBackground />

      <LandingContainer className="relative z-10 flex min-h-svh flex-col pt-12 pb-8">
        {/* INTERACTIVE CONTENT (z-10 above Spotlight inside the container) */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-8">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center xl:gap-6 2xl:gap-10">
            {/* LEFT COLUMN */}
            <div className="order-2 flex flex-col items-center text-center xl:order-1 xl:items-start xl:text-start">
              <motion.h1
                variants={containerVariants}
                initial={reduced ? false : "hidden"}
                animate={ready ? "visible" : "hidden"}
                custom={1}
                className="select-none text-[clamp(2.5rem,9vw,5rem)] 3xl:text-[clamp(2.5rem,5vw,6rem)] font-normal leading-none text-section-ink"
              >
                <div className="flex flex-wrap justify-center xl:justify-start">
                  {"AGENT".split("").map((letter, idx) => (
                    <motion.span
                      key={idx}
                      variants={blurWordVariants}
                      className="inline-block font-rostex tracking-tighter"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center xl:justify-start">
                  {"FINANCE".split("").map((letter, idx) => (
                    <motion.span
                      key={idx}
                      variants={blurWordVariants}
                      className="inline-block font-rostex-outline tracking-tighter"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </motion.h1>

              <motion.p
                variants={containerVariants}
                initial={reduced ? false : "hidden"}
                animate={ready ? "visible" : "hidden"}
                custom={1.4}
                className="mt-4 flex flex-wrap justify-center gap-x-[0.35em] font-mono font-light text-[clamp(0.85rem,2vw,1rem)] uppercase tracking-wide text-section-ink xl:justify-start"
              >
                {subtitleText.split(" ").map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={blurWordVariants}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            </div>

            {/* RIGHT COLUMN */}
            <div className="order-3 flex flex-col items-center gap-6 xl:items-end xl:gap-5">
              <HeroMiniChart />

              <motion.p
                variants={containerVariants}
                initial={reduced ? false : "hidden"}
                animate={ready ? "visible" : "hidden"}
                custom={2}
                className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-1 text-center text-sm font-light xl:justify-end xl:text-end"
              >
                {paragraphText.split(" ").map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={blurWordVariants}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.p>

              <div className="relative z-20 mb-4 flex justify-center xl:mb-0 xl:justify-end">
                <PremiumButton icon={ArrowRight} className="scale-105 py-6">
                  GET STARTED
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>

        {/* ROTATING BADGE (anchored at the container bottom, clear of the columns) */}
        <div className="mt-auto hidden md:block">
          <RotatingTextCircle
            text="NEURALPAY • SECURE INFRASTRUCTURE • "
            icon={ShieldCheck}
            iconSize={26}
          />
        </div>
      </LandingContainer>

      {/* BOTTOM BLUR OVERLAY */}
      <div className="absolute inset-x-0 bottom-0 h-[20vh] z-30 pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-[130%] backdrop-blur-sm mask-[linear-gradient(to_top,black_90%,transparent_100%)]" />
      </div>
    </section>
  );
}
