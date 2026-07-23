"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Activity, BarChart2, PieChart } from "lucide-react";

type ChartKind = "area" | "bar" | "pie";

const MOCK_TIME_SERIES = [
  { name: "Mon", val: 120 },
  { name: "Tue", val: 240 },
  { name: "Wed", val: 180 },
  { name: "Thu", val: 320 },
  { name: "Fri", val: 290 },
  { name: "Sat", val: 410 },
  { name: "Sun", val: 380 },
];

// Strictly Violet Monochromatic Brand Palette with Warm Orange Accent
const MOCK_PIE = [
  { name: "Food", val: 35, color: "#8b5cf6" }, // Violet
  { name: "Bills", val: 25, color: "#6366f1" }, // Violet-Blue
  { name: "Tech", val: 20, color: "#a78bfa" }, // Soft Violet
  { name: "Travel", val: 20, color: "#f97316" }, // Brand Accent Orange
];

// Custom Floating Mini Tooltip
function MiniCustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-none rounded-lg border border-violet-500/30 bg-neutral-950/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-mono">
        <span
          className="size-1.5 rounded-full"
          style={{
            backgroundColor: data.color || data.payload?.fill || "#8b5cf6",
          }}
        />
        <span className="text-white/60">{data.name}:</span>
        <span className="font-semibold text-white">${data.value}</span>
      </div>
    </motion.div>
  );
}

export function HeroMiniChart() {
  const [activeType, setActiveType] = useState<ChartKind>("area");

  // Auto-cycle charts every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveType((prev) => {
        if (prev === "area") return "bar";
        if (prev === "bar") return "pie";
        return "area";
      });
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  // Frame Variants for Container Card Slide-Up Fade Out/In Animation
  const containerVariants = {
    initial: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(4px)",
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeType}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-[280px] ml-auto rounded-2xl  p-4 backdrop-blur-xl shadow-2xl overflow-hidden text-white select-none"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-xs font-mono font-medium tracking-wide text-white/70 uppercase">
              Live Analytics
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
            <button
              onClick={() => setActiveType("area")}
              className={`rounded p-1 transition-colors ${
                activeType === "area"
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Activity className="size-3" />
            </button>
            <button
              onClick={() => setActiveType("bar")}
              className={`rounded p-1 transition-colors ${
                activeType === "bar"
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <BarChart2 className="size-3" />
            </button>
            <button
              onClick={() => setActiveType("pie")}
              className={`rounded p-1 transition-colors ${
                activeType === "pie"
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <PieChart className="size-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Inner Chart Display */}
        <div className="relative h-36 w-full">
          {activeType === "area" && (
            <motion.div
              key="area-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={MOCK_TIME_SERIES}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="violetGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<MiniCustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="val"
                    name="Spending"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#violetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeType === "bar" && (
            <motion.div
              key="bar-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_TIME_SERIES}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <Tooltip
                    content={<MiniCustomTooltip />}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Bar
                    dataKey="val"
                    name="Volume"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeType === "pie" && (
            <motion.div
              key="pie-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Tooltip content={<MiniCustomTooltip />} />
                  <Pie
                    data={MOCK_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={46}
                    paddingAngle={4}
                    dataKey="val"
                    strokeWidth={0}
                  >
                    {MOCK_PIE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Mini Bottom Metrics Footer */}
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/50 font-mono">
          <span>Volume Peak: $1,940</span>
          <span className="text-violet-400 font-semibold">+18.4%</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
