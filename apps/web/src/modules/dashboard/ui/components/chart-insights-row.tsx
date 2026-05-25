// components/chart-insights-row.tsx
"use client";

import { useRef, useState, useEffect } from "react";

export function ChartInsightsRow({
  chart,
  insights,
}: {
  chart: React.ReactNode;
  insights: React.ReactNode;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const measure = () => {
      // Force a layout recalc to get true height
      void el.offsetHeight;
      const rect = el.getBoundingClientRect();
      setHeight(rect.height);
    };

    // Initial measure
    const id = setTimeout(measure, 100);

    // Watch for ANY DOM changes inside chart (Recharts switching types)
    const observer = new MutationObserver(() => {
      requestAnimationFrame(measure);
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also on window resize
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(id);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div ref={chartRef} className="flex-1 min-w-0 self-start">
        {chart}
      </div>

      <div
        className="w-full xl:w-125 xl:shrink-0 overflow-hidden"
        style={height !== undefined ? { height: `${height}px` } : {}}
      >
        {insights}
      </div>
    </div>
  );
}
