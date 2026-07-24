"use client";

import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import { NoiseTexture } from "@neuralpay/ui/components/magicui/noise-texture";
import BorderGlow from "@neuralpay/ui/components/react-bits/border-glow";
import Strands from "@neuralpay/ui/components/react-bits/strands";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUpRight, CheckCircle2, Bot, User } from "lucide-react";

// Agent prompts and structured responses
const AGENT_SCENARIOS = [
  {
    prompt: "How much did I spend dining out this week?",
    response:
      "You spent $184.50 across 4 places. That's 12% lower than last week!",
    tags: [
      { label: "Uber Eats", amount: "-$42.10", color: "text-amber-400" },
      { label: "Starbucks", amount: "-$14.20", color: "text-amber-400" },
    ],
  },
  {
    prompt: "Split last night's $120 dinner bill with Alex & Sarah.",
    response:
      "Requested $40.00 each via Neural Pay split. Links sent automatically.",
    tags: [
      { label: "Alex (Pending)", amount: "+$40.00", color: "text-violet-400" },
      {
        label: "Sarah (Cleared)",
        amount: "+$40.00",
        color: "text-emerald-400",
      },
    ],
  },
  {
    prompt: "Explain the $420 transaction from Stripe Connect.",
    response:
      "Software payout from Vault #09. Automatically allocated 20% to taxes.",
    tags: [
      { label: "Tax Vault", amount: "-$84.00", color: "text-emerald-400" },
      { label: "Liquid Core", amount: "+$336.00", color: "text-emerald-400" },
    ],
  },
];

export default function HeroNeuralCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Agent State Engine
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const currentScenario = AGENT_SCENARIOS[scenarioIndex];

  // Typewriter + AI Loop Cycle
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fullText = currentScenario.prompt;

    if (isTyping) {
      if (displayedPrompt.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedPrompt(fullText.slice(0, displayedPrompt.length + 1));
        }, 35);
      } else {
        // Typing done -> trigger "Thinking" state
        setIsTyping(false);
        setIsThinking(true);
        timeout = setTimeout(() => {
          setIsThinking(false);
          setShowResponse(true);
        }, 1200);
      }
    } else if (showResponse) {
      // Hold response card -> cycle to next scenario
      timeout = setTimeout(() => {
        setShowResponse(false);
        setDisplayedPrompt("");
        setScenarioIndex((prev) => (prev + 1) % AGENT_SCENARIOS.length);
        setIsTyping(true);
      }, 4500);
    }

    return () => clearTimeout(timeout);
  }, [
    displayedPrompt,
    isTyping,
    showResponse,
    scenarioIndex,
    currentScenario.prompt,
  ]);

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
    <div className="relative flex flex-col items-center justify-center p-6 select-none mt-20 overflow-hidden mask-b-from-40% mask-b-to-90%">
      <BorderGlow
        borderRadius={28}
        glowColor="270 85 70"
        backgroundColor={LANDING_THEME.card}
        edgeSensitivity={25}
        glowIntensity={1.2}
        glowRadius={35}
        coneSpread={30}
        animated={true}
        colors={[LANDING_THEME.violet500, LANDING_THEME.indigo]}
        fillOpacity={0.5}
        className="w-85 h-175 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden transition-transform duration-300"
      >
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative h-full w-full p-5 flex flex-col justify-between overflow-hidden rounded-[inherit]"
        >
          <NoiseTexture
            frequency={0.5}
            octaves={5}
            slope={0.4}
            noiseOpacity={0.8}
          />

          {/* GLARE OVERLAY */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%)`,
            }}
          />

          {/* HEADER BADGE */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-white/80 font-semibold uppercase">
                NEURAL • AGENT ACTIVE
              </span>
            </div>
          </div>

          {/* CENTER NEURAL CORE VISUAL */}
          <div className="relative z-20 my-20 flex flex-col items-center justify-center">
            <div className="relative h-36 w-36 flex items-center justify-center">
              <Strands
                colors={["#f9f9f9", "#ffffff", LANDING_THEME.indigo]}
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

          {/* AGENT CHAT INTERFACE AREA */}
          <div className="relative z-20 flex flex-col gap-2.5 mb-2 min-h-55">
            {/* USER PROMPT INPUT BUBBLE */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="size-6 rounded-md bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-3.5 text-violet-300" />
              </div>
              <p className="text-xs font-mono text-white/90 leading-relaxed min-h-9">
                {displayedPrompt}
                {isTyping && (
                  <span className="inline-block w-1.5 h-3 bg-violet-400 ml-1 animate-pulse" />
                )}
              </p>
            </div>

            {/* AI THINKING STATE */}
            <AnimatePresence mode="wait">
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-950/40 border border-violet-500/20 text-[11px] font-mono text-violet-300"
                >
                  <Sparkles className="size-3.5 animate-spin text-violet-400" />
                  <span>Analyzing ledger & context...</span>
                </motion.div>
              )}

              {/* AI RESPONSE CARD */}
              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex flex-col gap-2 p-3 rounded-xl bg-gradient-to-b from-violet-900/40 to-black/60 border border-violet-500/30 backdrop-blur-xl shadow-lg"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-300 font-semibold uppercase">
                    <Bot className="size-3.5 text-violet-400" />
                    <span>Agent Insights</span>
                  </div>

                  <p className="text-xs font-sans text-white/90 leading-snug">
                    {currentScenario.response}
                  </p>

                  {/* TRANSACTION TAG CHIPS */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {currentScenario.tags.map((tag, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono"
                      >
                        <span className="text-white/70 flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-violet-400" />{" "}
                          {tag.label}
                        </span>
                        <span className={`font-bold ${tag.color}`}>
                          {tag.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </BorderGlow>
    </div>
  );
}
