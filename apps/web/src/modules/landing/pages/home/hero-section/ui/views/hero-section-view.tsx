"use client";

import {
  ArrowBigDown,
  ArrowRight,
  ChevronDown,
  ChevronDownIcon,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

import { PremiumButton } from "@/components/premium-button";
import { SpinningText } from "@neuralpay/ui/components/magicui/spinning-text";
import HeroBackground from "../components/hero-background";
import { HeroMiniChart } from "../components/hero-mini-chart";
import HeroNeuralCard from "../components/hero-neural-card";
import { RotatingTextCircle } from "@/components/rotating-text-circle";

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
    <section className="relative min-h-screen w-full overflow-hidden bg-landing-bg text-white">
      <HeroBackground />

      <div className="relative z-10  max-w-7xl 3xl:max-w-450 4xl:max-w-500 mx-auto flex min-h-screen flex-col justify-between pt-12">
        <div className="relative flex w-full flex-1 items-center justify-between">
          {/* LEFT COLUMN */}
          <div className="absolute left-0 top-[26%] z-20 h-full w-full max-w-2xl">
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              custom={1}
              className="select-none text-[clamp(2.5rem,15vw,6.5rem)] font-normal leading-none text-gray-100/70"
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
              className="mt-4 flex flex-wrap gap-x-[0.35em] font-mono font-light text-md uppercase tracking-wide text-violet-100"
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

          <div className="absolute top-[70%] left-[0%] hidden md:block">
            <RotatingTextCircle
              text="NEURALPAY • SECURE INFRASTRUCTURE • "
              icon={ShieldCheck}
              iconSize={26}
            />
          </div>

          {/* CENTER CARD */}
          <div className="mx-auto flex items-center justify-center">
            <HeroNeuralCard />
          </div>

          {/* RIGHT COLUMN */}
          <div className="absolute right-0 top-[26%] z-20 ml-auto max-w-sm space-y-5">
            <HeroMiniChart />

            <motion.p
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-wrap justify-end gap-x-[0.35em] gap-y-1 text-end text-sm font-light text-white/60"
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
            <div className="relative z-30 mb-4 flex justify-end">
              <PremiumButton icon={ArrowRight} className="scale-105 py-6">
                GET STARTED
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION */}
      </div>
    </section>
  );
}
