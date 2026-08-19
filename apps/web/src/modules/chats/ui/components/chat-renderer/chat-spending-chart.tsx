"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orra/ui/components/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAmount } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/modules/dashboard/constants";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface Props {
  chartType: "pie" | "bar" | "area";
  title: string;
  data: ChartDataPoint[];
}

function SimpleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{payload[0].payload.label}</p>
      <p className="font-mono text-muted-foreground">
        {formatAmount(payload[0].value)}
      </p>
    </div>
  );
}

export function ChatSpendingChart({ chartType, title, data }: Props) {
  if (!data.length) {
    return (
      <Card className="my-2 w-full rounded-2xl border-border">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No spending data for this period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-2 border-border rounded-2xl w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 px-2 ">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="50%"
                outerRadius="80%"
                strokeWidth={0}
              >
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={CATEGORY_COLORS[d.label] ?? CATEGORY_COLORS.other}
                  />
                ))}
              </Pie>
              <Tooltip content={<SimpleTooltip />} />
            </PieChart>
          ) : chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="var(--muted)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip content={<SimpleTooltip />} />
              <Bar
                dataKey="value"
                fill="var(--chart-3)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                opacity={0.9}
              />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                {/* Spending gradient — blue */}
                <linearGradient
                  // id={spendingGradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={"#fde047"} stopOpacity={0.3} />
                  <stop
                    offset="95%"
                    stopColor={"var(--chart-3)"}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--muted)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip content={<SimpleTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
