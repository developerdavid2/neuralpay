"use client";

import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SPENDING_COLORS, SPENDING_LABELS } from "../../constants";

export function SpendingChart() {
  const trpc = useTRPC();
  const now = new Date();

  const { data } = useSuspenseQuery(
    trpc.payments.transactions.spendingByCategory.queryOptions({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  );

  const chartData = data.map((d) => ({
    name: SPENDING_LABELS[d.category] ?? d.category,
    value: Math.round(d.total * 100) / 100,
    color: SPENDING_COLORS[d.category] ?? SPENDING_COLORS.other,
  }));

  const totalSpend = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Spending by Category
        </h2>
        <span className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
          }).format(now)}
        </span>
      </div>

      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No spending data this month.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Donut */}
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-2">
            {chartData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-foreground">
                  ${entry.value.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-xs font-semibold text-foreground">
                Total
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                ${totalSpend.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
