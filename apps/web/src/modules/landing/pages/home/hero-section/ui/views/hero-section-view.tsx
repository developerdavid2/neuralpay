"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import { PremiumButton } from "@/components/premium-button";
import { RotatingTextCircle } from "@/components/rotating-text-circle";
import { Spotlight } from "@neuralpay/ui/components/spotlight";
import HeroBackground from "../components/hero-background";
import { HeroMiniChart } from "../components/hero-mini-chart";
import HeroNeuralCard from "../components/hero-neural-card";

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
  const subtitleText = "Understand your money with effortless clarity.";
  const paragraphText =
    "NeuralPay connects to your bank accounts, explains your spending in plain English, and automates peer bill splits.";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      <HeroBackground />

      <div className="relative z-10 max-w-7xl 3xl:max-w-450 4xl:max-w-500 mx-auto min-h-screen pt-12">
        <div className="pointer-events-none absolute inset-0 z-20 overflow-visible opacity-10 dark:opacity-70">
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:left-30 rotate-50 "
            fill="#b296ff"
          />
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:-left-70 rotate-70 "
            fill="#b296ff"
          />
        </div>

        {/* INTERACTIVE CONTENT (z-10 above Spotlight inside the container) */}
        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          <div className="relative flex w-full flex-1 items-center justify-between">
            {/* LEFT COLUMN */}
            <div className="absolute left-0 top-[26%] z-10 h-full w-full max-w-2xl">
              <motion.h1
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="select-none text-[clamp(2.5rem,15vw,6rem)] font-normal leading-none text-foreground"
              >
                <div className="flex flex-wrap">
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

                <div className="flex flex-wrap">
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
                initial="hidden"
                animate="visible"
                custom={1.4}
                className="mt-4 flex flex-wrap gap-x-[0.35em] font-mono font-light text-md uppercase tracking-wide text-accent-foreground"
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

            {/* CENTER CARD */}
            <div className="mx-auto flex items-center justify-center">
              <HeroNeuralCard />
            </div>

            {/* RIGHT COLUMN */}
            <div className="absolute right-0 top-[26%] z-10 ml-auto max-w-sm space-y-5">
              <HeroMiniChart />

              <motion.p
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="flex flex-wrap justify-end gap-x-[0.35em] gap-y-1 text-end text-sm font-light"
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

              <div className="relative z-20 mb-4 flex justify-end">
                <PremiumButton icon={ArrowRight} className="scale-105 py-6">
                  GET STARTED
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>

        {/* ROTATING BADGE (Anchored relative to max-w container) */}
        <div className="absolute top-[70%] left-0 hidden md:block z-20">
          <RotatingTextCircle
            text="NEURALPAY • SECURE INFRASTRUCTURE • "
            icon={ShieldCheck}
            iconSize={26}
          />
        </div>
      </div>

      {/* BOTTOM BLUR OVERLAY */}
      <div className="absolute inset-x-0 bottom-0 h-[20vh] z-30 pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-[130%] backdrop-blur-sm mask-[linear-gradient(to_top,black_90%,transparent_100%)]" />
      </div>
    </section>
  );
}
