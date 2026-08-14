import { tool } from "ai";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { z } from "zod";
import {
  fetchCategorySpending,
  fetchTrendSpending,
} from "../../lib/spending";

export function buildSpendingChartTool(userId: string) {
  return tool({
    description:
      "Render an interactive chart of the user's spending — by category (pie/bar) or over time (area). Call this whenever a visual breakdown would help answer the user's question.",
    inputSchema: z.object({
      chartType: z.enum(["pie", "bar", "area"]),
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
      title: z.string(),
    }),
    execute: async ({ chartType, period, title }) => {
      const now = new Date();
      const days = period === "7d" ? 6 : period === "90d" ? 89 : 29;
      const startDate = startOfDay(subDays(now, days));
      const endDate = endOfDay(now);

      const categorySpending = await fetchCategorySpending(userId, {
        startDate,
        endDate,
      });

      if (chartType !== "area") {
        return {
          chartType,
          title,
          data: categorySpending.map((c) => ({
            label: c.category ?? "other",
            value: c.total,
          })),
        };
      }

      const trend = await fetchTrendSpending(userId, startDate, endDate, "day");
      return { chartType, title, data: trend };
    },
  });
}
