import { formatAmount } from "@/lib/utils";
import {
  ArrowLeftRight,
  Bell,
  BrainCircuit,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

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

export const cardTemplates = [
  {
    label: "Total Balance",
    icon: Wallet,
    trend: "+2.4% this month",
    up: true,
    accent: "text-primary",
    iconBg: "bg-primary/10",
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
    accent: "text-primary",
    iconBg: "bg-primary/10",
    formatValue: (value: number) => String(value),
  },
] as const;

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

export const CATEGORY_COLORS: Record<string, string> = {
  food_dining: "bg-[#FDE8E8] text-[#E05C5C]",
  transport: "bg-[#EDE9FE] text-[#7C3AED]",
  shopping: "bg-[#FEF3C7] text-[#D4A017]",
  entertainment: "bg-[#FDE8E8] text-[#E05C5C]",
  income: "bg-[#D1FAF8] text-[#0EA5A0]",
  utilities: "bg-[#F3F4F6] text-[#6B7280]",
  rent: "bg-[#F3F4F6] text-[#6B7280]",
  groceries: "bg-[#D1FAF8] text-[#0EA5A0]",
  subscriptions: "bg-[#EDE9FE] text-[#7C3AED]",
  other: "bg-[#F3F4F6] text-[#6B7280]",
} as const;

export const SPENDING_COLORS: Record<string, string> = {
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

export const SPENDING_LABELS: Record<string, string> = {
  food_dining: "Food & Dining",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  groceries: "Groceries",
  subscriptions: "Subscriptions",
  utilities: "Utilities",
  rent: "Rent",
  other: "Other",
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
