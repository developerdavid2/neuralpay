"use client";

import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { NoiseTexture } from "@neuralpay/ui/components/magicui/noise-texture";
import BorderGlow from "@neuralpay/ui/components/react-bits/border-glow";
import Strands from "@neuralpay/ui/components/react-bits/strands";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bot, CheckCircle2, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { AGENT_SCENARIOS } from "../../constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export default function HeroNeuralCard() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const clipWrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [glare, setGlare] = useState({ x: 20, y: 20, opacity: 0 });
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "response">(
    "typing",
  );

  const currentScenario = AGENT_SCENARIOS[scenarioIndex]!;

  // ── GSAP entrance timeline (one coordinated reveal, clip first so nothing flashes on load)
  useGSAP(
    () => {
      if (reduced) {
        // Reduced motion: resolve straight to the final, fully visible state
        gsap.set(clipWrapRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        });
        return;
      }

      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        clipWrapRef.current,
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.9,
          ease: "power4.inOut",
        },
      )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
          "-=0.55",
        )
        .fromTo(
          badgeRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "<",
        )
        .fromTo(
          coreRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.35",
        )
        .fromTo(
          chatRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
          "-=0.3",
        );

      // Neural core continuous pulse (starts once the entrance settles)
      gsap.to(coreRef.current, {
        scale: 1.06,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    },
    { scope: containerRef, dependencies: [reduced] },
  );

  // ── GSAP staggered reveal of the response rows when the agent answers (bar grow, not Motion)
  useGSAP(
    () => {
      if (reduced) return;
      if (phase !== "response") return;
      const rows = containerRef.current?.querySelectorAll(".chart-bar");
      if (!rows?.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 14, scaleY: 0.85, transformOrigin: "top" },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.07,
          delay: 0.15,
        },
      );
    },
    { scope: containerRef, dependencies: [reduced, phase] },
  );

  // ── Typewriter loop
  useEffect(() => {
    if (reduced) {
      setDisplayedPrompt(currentScenario.prompt);
      setPhase("response");
      return;
    }
    let timeout: NodeJS.Timeout;
    const fullText = currentScenario.prompt;

    if (phase === "typing") {
      if (displayedPrompt.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedPrompt(fullText.slice(0, displayedPrompt.length + 1));
        }, 35);
      } else {
        // Done typing → thinking
        timeout = setTimeout(() => setPhase("thinking"), 300);
      }
    } else if (phase === "thinking") {
      timeout = setTimeout(() => setPhase("response"), 1200);
    } else if (phase === "response") {
      // Hold response → cycle to next
      timeout = setTimeout(() => {
        setDisplayedPrompt("");
        setScenarioIndex((prev) => (prev + 1) % AGENT_SCENARIOS.length);
        setPhase("typing");
      }, 4500);
    }

    return () => clearTimeout(timeout);
  }, [displayedPrompt, phase, currentScenario.prompt, scenarioIndex, reduced]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlare({ x, y, opacity: 0.35 });
  };

  const handlePointerLeave = () => {
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center p-6 select-none"
    >
      <div
        ref={clipWrapRef}
        className="overflow-hidden rounded-[28px] mask-[linear-gradient(to_bottom,black_80%,transparent_90%)]"
      >
        <BorderGlow
          borderRadius={28}
          edgeSensitivity={25}
          backgroundColor={LANDING_THEME.card}
          animated={true}
          colors={[LANDING_THEME.foreground, LANDING_THEME.violet600]}
          fillOpacity={0.5}
          className="w-full max-w-[20rem] sm:max-w-[21rem] xl:w-95 xl:max-w-none xl:h-[min(46rem,calc(100svh-7rem))] overflow-hidden transition-transform duration-300"
        >
          <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="relative h-full w-full p-5 flex flex-col justify-between gap-y-5 xl:gap-y-15 overflow-hidden rounded-[inherit]"
          >
            <NoiseTexture
              frequency={0.5}
              octaves={5}
              slope={0.4}
              noiseOpacity={0.2}
            />

          {/* GLARE OVERLAY */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)`,
            }}
          />

          {/* HEADER BADGE */}
          <div
            ref={badgeRef}
            className="relative z-20 flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-white/80 font-semibold uppercase">
                NEURAL • AGENT ACTIVE
              </span>
            </div>
          </div>

          {/* CENTER NEURAL CORE */}
          <div
            ref={coreRef}
            className="relative z-20 flex flex-1 flex-col items-center justify-center"
          >
            <div className="relative size-fit flex items-center justify-center">
              <Strands
                colors={[
                  LANDING_THEME.foreground,
                  LANDING_THEME.foreground,
                  LANDING_THEME.indigo,
                ]}
                count={3}
                speed={0.5}
                amplitude={1}
                waviness={1}
                thickness={0.7}
                glow={2.6}
                taper={3}
                spread={1.6}
                intensity={0.6}
                saturation={2}
                opacity={1}
                scale={1.4}
                glass={false}
                refraction={1}
                dispersion={1}
                glassSize={1}
                hueShift={0}
              />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase -mt-1 flex items-center gap-1">
              <Sparkles className="size-3 text-violet-400" /> REASONING ENGINE
              v2.4
            </span>
          </div>

          {/* AGENT CHAT */}
          <div
            ref={chatRef}
            className="relative z-20 flex flex-col gap-2.5 mb-2 min-h-[9.5rem] xl:min-h-55"
          >
            {/* USER PROMPT */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="size-6 rounded-md bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-3.5 text-violet-300" />
              </div>
              <p className="text-xs font-mono text-white/90 leading-relaxed min-h-9">
                {displayedPrompt}
                {phase === "typing" && (
                  <span className="inline-block w-1.5 h-3 bg-violet-400 ml-1 animate-pulse" />
                )}
              </p>
            </div>

            {/* THINKING / RESPONSE */}
            <AnimatePresence mode="wait">
              {phase === "thinking" && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-main/10 border border-violet-500/20 text-[11px] font-mono text-violet-300"
                >
                  <Sparkles className="size-3.5 animate-spin text-violet-400" />
                  <span>Analyzing ledger & context...</span>
                </motion.div>
              )}

              {phase === "response" && (
                <motion.div
                  key={`response-${scenarioIndex}`}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col gap-3 p-3.5 rounded-2xl bg-linear-to-tr from-zinc-900/10  to-neutral-500/20 shadow-2xl backdrop-blur-lg overflow-hidden"
                >
                  {/* Subtle glass gloss highlight */}
                  <div className="absolute -top-10 left-40 w-full h-100 bg-white/10 rounded-full blur-xl pointer-events-none rotate-30" />
                  {/* AI AGENT HEADER BADGE */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-300 font-semibold uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                      </span>
                      <Bot className="size-3.5 text-violet-400" />
                      <span>Agent Insight</span>
                    </div>
                  </div>

                  {/* AI RESPONSE PROSE */}
                  <p className="text-xs font-sans text-white/90 leading-relaxed font-light">
                    {currentScenario.response}
                  </p>

                  {/* HERO CARD BALANCE (Pulls directly from currentScenario.tags[0]) */}
                  {currentScenario.tags.length > 0 && (
                    <div className="chart-bar relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl shadow-inner">
                      <div className="flex flex-col z-10">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-violet-300/80">
                          {currentScenario.tags[0].label}
                        </span>
                        <div
                          className={`text-2xl font-bold font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)] ${currentScenario.tags[0].color}`}
                        >
                          {currentScenario.tags[0].amount}
                        </div>
                      </div>

                      {/* Status / Indicator Badge */}
                      <div className="z-10 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Calculated
                      </div>
                    </div>
                  )}

                  {/* SUB-TAGS / BREAKDOWN ITEMS (Renders remaining tags if there are more than one) */}
                  {currentScenario.tags.length > 1 && (
                    <div className="flex flex-col gap-1.5 mt-0.5">
                      {currentScenario.tags.slice(1).map((tag, i) => (
                        <div
                          key={i}
                          className="chart-bar flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 transition-colors text-[11px] font-mono"
                        >
                          <span className="text-white/80 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-violet-400 shrink-0" />
                            {tag.label}
                          </span>
                          <span className={`font-bold ${tag.color}`}>
                            {tag.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </BorderGlow>
    </div>
    </div>
  );
}
