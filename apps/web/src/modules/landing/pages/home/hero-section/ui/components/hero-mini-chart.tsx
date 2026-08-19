"use client";

import { motion } from "motion/react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "@/modules/landing/lib/reduced-motion";
import { useLandingReady } from "@/modules/landing/lib/use-landing-ready";
import { LANDING_THEME } from "@/modules/landing/pages/constants/theme";
import { MOCK_TIME_SERIES } from "../../constants";

export function HeroMiniChart() {
  const reduced = useReducedMotion();
  const ready = useLandingReady((s) => s.ready);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="absolute bottom-[20%] z-4 w-40 rounded-2xl p-4 shadow-2xl  bg-landing-card/20 backdrop-blur-md border border-white/10 select-none"
    >
      {/* Main Account Figure */}
      <div className="my-1">
        <div className="font-mono text-lg font-bold tracking-tight text-section-ink">
          $128,430<span className="text-section-muted/60 text-lg">.00</span>
        </div>
      </div>

      {/* Area Growth Chart */}
      <div className="relative h-16 w-full overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MOCK_TIME_SERIES}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="heroAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={LANDING_THEME.violet500}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={LANDING_THEME.violet500}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={LANDING_THEME.violet500}
              strokeWidth={2}
              fill="url(#heroAreaGradient)"
              isAnimationActive={!reduced}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
