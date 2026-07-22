"use client";

import React, { useRef, useState } from "react";
import BorderGlow from "@neuralpay/ui/components/react-bits/border-glow";
// import Orb from "@neuralpay/ui/components/react-bits/orb";
import Strands from "@neuralpay/ui/components/react-bits/strands";
import { NoiseTexture } from "@neuralpay/ui/components/magicui/noise-texture";
import {
  AnimatedList,
  AnimatedListItem,
} from "@neuralpay/ui/components/magicui/animated-list";

// Mock Transactions Stream
const TRANSACTIONS = [
  {
    id: "tx-1",
    name: "Payment Received",
    source: "NeuralPay Network",
    time: "Just now",
    amount: "+$1,250.00",
    icon: "⚡",
    bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "tx-2",
    name: "AI Yield Distribution",
    source: "Vault #09",
    time: "2m ago",
    amount: "+$84.12",
    icon: "🤖",
    bg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "tx-3",
    name: "Settlement Cleared",
    source: "Stripe Connect",
    time: "5m ago",
    amount: "+$420.00",
    icon: "💳",
    bg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
];

export default function HeroNeuralCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Metallic glare dynamic sheen tracker
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
    <div className="relative flex flex-col items-center justify-center p-6 select-none mt-20 overflow-hidden mask-b-from-40%">
      {/* 1. BORDER GLOW CONTAINER ENCLOSING THE CARD */}
      <BorderGlow
        borderRadius={28}
        glowColor="270 85 70" // Vibrant Violet HSL
        backgroundColor="#2C2242"
        edgeSensitivity={25}
        glowIntensity={1.2}
        glowRadius={35}
        coneSpread={30}
        animated={true}
        colors={["#a855f7", "#6366f1", "#38bdf8"]}
        fillOpacity={0.8}
        className="w-[340px] h-[700px] shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden transition-transform duration-300"
      >
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative h-full w-full p-6 flex flex-col justify-between overflow-hidden rounded-[inherit]"
        >
          {/* 2. CUSTOM SVG NOISE TEXTURE LAYER */}
          <NoiseTexture
            frequency={0.5}
            octaves={5}
            slope={0.2}
            noiseOpacity={0.7}
          />

          {/* 3. DYNAMIC HOVER GLARE OVERLAY */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%)`,
            }}
          />

          {/* 4. CREDIT CARD HEADER (EMBEDDED CHIP & LOGO) */}
          <div className="relative z-20 flex items-center justify-between">
            {/* Neural Brand Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-white/80 font-semibold uppercase">
                NEURAL • PAY
              </span>
            </div>
          </div>

          {/* 5. CENTER AI CORE (WEBGL SHADER ORB) */}
          <div className="relative z-20 my-auto flex flex-col items-center justify-center">
            <div className="relative h-40 w-40 flex items-center justify-center">
              {/* WebGL Orb Component */}
              {/* <Orb
                hue={2}
                hoverIntensity={0.5}
                rotateOnHover={true}
                backgroundColor="#0A0A0F"
              /> */}

              <Strands
                colors={["#f9f9f9", "#ffffff", "#0606d4"]}
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
                scale={1.5}
                glass={false}
                refraction={1}
                dispersion={1}
                glassSize={1}
                hueShift={0}
              />
            </div>

            {/* Currency Ledger Signaling */}
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase -mt-2">
              USD CORE • ACTIVE
            </span>
          </div>

          {/* 6. BOTTOM ANIMATED NOTIFICATIONS STREAM */}
          <div className="relative z-20 flex flex-col gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 px-1">
              Live Network Feed
            </span>

            <AnimatedList delay={1500} className="w-full gap-2">
              {TRANSACTIONS.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.06] transition-colors w-full"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg border flex items-center justify-center text-xs ${tx.bg}`}
                    >
                      {tx.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white/90 leading-tight">
                        {tx.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {tx.source} • {tx.time}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {tx.amount}
                  </span>
                </div>
              ))}
            </AnimatedList>
          </div>
        </div>
      </BorderGlow>

      {/* 7. REFLECTION & CONTACT SHADOW (Monolith ground style) */}
      <div className="relative w-[340px] h-10 -mt-3 pointer-events-none flex flex-col items-center">
        <div className="w-4/5 h-2.5 bg-black/90 blur-md rounded-full" />
        <div className="w-full h-8 bg-gradient-to-b from-violet-500/20 via-purple-500/5 to-transparent blur-xl transform scale-y-[-1] opacity-70" />
      </div>
    </div>
  );
}
