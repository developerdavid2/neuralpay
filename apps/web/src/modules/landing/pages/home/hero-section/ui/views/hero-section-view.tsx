"use client";

import { motion } from "motion/react";
import HeroBackground from "../components/hero-background";
import { HeroMiniChart } from "../components/hero-mini-chart";
import HeroNeuralCard from "../components/hero-neural-card";

// Framer Motion Stagger Variants
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
  const paragraphText =
    "NeuralPay connects to your bank accounts, explains your spending in plain English, and automates peer bill splits.";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#151515]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex max-w-[2000px] flex-col items-center px-4">
        {/* LEFT H1 TITLE (STAGGERED BLUR-IN) */}
        <div className="absolute left-0 top-[30%] w-full pl-10">
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="select-none font-normal text-[clamp(4.5rem,15vw,6rem)] leading-none text-gray-100/90"
          >
            {/* "NEURAL" Staggered Words */}
            <div className="flex flex-wrap">
              {"NEURAL".split("").map((letter, idx) => (
                <motion.span
                  key={idx}
                  variants={blurWordVariants}
                  className="inline-block font-rostex tracking-tighter"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* "PAY" Outline Staggered Words */}
            <div className="flex flex-wrap">
              {"PAY".split("").map((letter, idx) => (
                <motion.span
                  key={idx}
                  variants={blurWordVariants}
                  className="font-rostex-outline inline-block tracking-tighter"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.h1>
        </div>

        {/* CENTER CARD CORE */}
        <HeroNeuralCard />

        {/* RIGHT PARAGRAPH (STAGGERED WORD BLUR-IN) */}
        <div className="absolute right-0 top-[30%] w-full pr-10 mt-10 ml-auto max-w-sm">
          <HeroMiniChart />
          <motion.p
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-end font-light text-sm text-white/60 flex flex-wrap justify-end gap-x-[0.35em] gap-y-1"
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

          {/* Optional Premium Button placement */}
          {/* <div className="flex justify-end mt-6">
            <PremiumButton>Sign up</PremiumButton>
          </div> */}
        </div>
      </div>
    </section>
  );
}
