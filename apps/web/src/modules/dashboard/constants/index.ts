import { formatAmount } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Car,
  GraduationCap,
  Home,
  Landmark,
  LayoutDashboard,
  Package,
  PieChart,
  PiggyBank,
  Receipt,
  Repeat,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";
import type { ChartType, Period } from "../types";

// SIDEBAR NAVIGATIONS
export const navGroups = [
  {
    label: "Finance",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      {
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: ArrowLeftRight,
      },
      { title: "Accounts", url: "/dashboard/accounts", icon: Landmark },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        title: "AI Insights",
        url: "/dashboard/ai-insights",
        icon: BrainCircuit,
      },
    ],
  },
  {
    label: "Social",
    items: [
      { title: "Splits", url: "/dashboard/splits", icon: Receipt },
      { title: "Vaults", url: "/dashboard/vaults", icon: PiggyBank },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
] as const;

// STATS CARDS
export const cardTemplates = [
  {
    label: "Total Balance",
    icon: Wallet,
    trend: "+2.4% this month",
    up: true,
    accent: "text-main",
    iconBg: "bg-main/10",
    formatValue: (value: number) => formatAmount(value),
  },
  {
    label: "Month Spending",
    icon: TrendingDown,
    trend: "vs last month",
    up: false,
    accent: "text-destructive",
    iconBg: "bg-destructive/10",
    formatValue: (value: number) => formatAmount(value),
  },
  {
    label: "Savings Rate",
    icon: TrendingUp,
    trend: "of total balance",
    up: true,
    accent: "text-[#0EA5A0]",
    iconBg: "bg-[#0EA5A0]/10",
    formatValue: (value: number) => `${value}%`,
  },
  {
    label: "Active Accounts",
    icon: Landmark,
    trend: "connected",
    up: true,
    accent: "text-main",
    iconBg: "bg-main/10",
    formatValue: (value: number) => String(value),
  },
] as const;

// SHARED CATEGORY LABELS
export const CATEGORY_LABELS: Record<string, string> = {
  food_dining: "Food & Dining",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  income: "Income",
  utilities: "Utilities",
  rent: "Rent",
  healthcare: "Healthcare",
  education: "Education",
  groceries: "Groceries",
  subscriptions: "Subscriptions",
  investment: "Investment",
  transfer: "Transfer",
  other: "Other",
} as const;

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  food_dining: Utensils,
  groceries: ShoppingCart,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Smartphone,
  utilities: Zap,
  rent: Home,
  healthcare: Stethoscope,
  education: GraduationCap,
  subscriptions: Repeat,
  investment: TrendingUp,
  transfer: ArrowDownLeft,
  income: ArrowUpRight,
  other: Package,
};
// SPENDING OVERVIEW
export const CATEGORY_COLORS: Record<string, string> = {
  food_dining: "#E05C5C",
  transport: "#7C3AED",
  shopping: "#D4A017",
  entertainment: "#F97316",
  groceries: "#0EA5A0",
  subscriptions: "#6D28D9",
  utilities: "#8B88A0",
  rent: "#2D2B3B",
  other: "#CBD5E1",
};

// export const SPENDING_LABELS: Record<string, string> = {
//   food_dining: "Food & Dining",
//   transport: "Transport",
//   shopping: "Shopping",
//   entertainment: "Entertainment",
//   groceries: "Groceries",
//   subscriptions: "Subscriptions",
//   utilities: "Utilities",
//   rent: "Rent",
//   other: "Other",
// };

// PERIOD LABES

export const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

// CHART TYPE
export const CHART_PERIODS = [
  { value: "7d", label: "7 Days", short: "7D" },
  { value: "30d", label: "30 Days", short: "30D" },
  { value: "90d", label: "90 Days", short: "90D" },
] as const;
export const CHART_TYPES = [
  { type: "pie" as ChartType, icon: PieChart, label: "Pie chart" },
  { type: "bar" as ChartType, icon: BarChart3, label: "Bar chart" },
  { type: "area" as ChartType, icon: TrendingUp, label: "Area chart" },
] as const;

// Chart colors — distinct spending vs budget
export const CHART_COLORS = {
  spending: {
    stroke: "var(--chart-3)",
    fill: "var(--chart-3)",
    gradientFrom: "#fde047",
    gradientTo: "var(--chart-3)",
  },
  budget: {
    stroke: "var(--primary)",
    fill: "var(--primary)",
    gradientFrom: "#a78bfa",
    gradientTo: "var(--primary)",
  },
};

export const INSIGHTS_TYPE_STYLES: Record<string, string> = {
  anomaly: "bg-destructive/10 text-destructive",
  saving: "bg-[#D1FAF8] text-[#0EA5A0]",
  opportunity: "bg-[#EDE9FE] text-[#7C3AED]",
  trend: "bg-[#FEF3C7] text-[#D4A017]",
};

export const INSIGHTS_TYPE_LABELS: Record<string, string> = {
  anomaly: "Anomaly",
  saving: "Saving",
  opportunity: "Opportunity",
  trend: "Trend",
};
