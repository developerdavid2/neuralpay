import type { AccountStatus } from "@neuralpay/types";
import {
  Bitcoin,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit Card",
  investment: "Investment",
  crypto: "Crypto Wallet",
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  disconnected: "Disconnected",
};
export const ACCOUNT_STATUS_STYLES: Record<AccountStatus, string> = {
  active:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  disconnected:
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const ACCOUNT_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    gradient: string;
    gradientLight?: string;
    chipColor: string;
    isLiability: boolean;
  }
> = {
  checking: {
    label: "Checking",
    shortLabel: "CHK",
    icon: Wallet,
    gradient:
      "bg-[radial-gradient(ellipse_at_60%_0%,#4796D5_0%,#173356_40%,#0c1116_100%)]",
    chipColor: "bg-white/20",
    isLiability: false,
  },
  savings: {
    label: "Savings",
    shortLabel: "SAV",
    icon: PiggyBank,
    // Vibrant green/emerald
    gradient:
      "bg-[radial-gradient(ellipse_at_130%_0%,#47d3b0_0%,#165444_40%,#0b1412_100%)]",
    chipColor: "bg-white/20",
    isLiability: false,
  },
  credit: {
    label: "Credit",
    shortLabel: "CRD",
    icon: CreditCard,
    // Vibrant red/rose
    gradient:
      "bg-[radial-gradient(ellipse_at_20%_0%,#87424b_0%,#5b1a25_40%,#28050c_100%)]",
    chipColor: "bg-white/20",
    isLiability: true,
  },
  investment: {
    label: "Investment",
    shortLabel: "INV",
    icon: TrendingUp,
    // Vibrant violet/purple
    gradient:
      "bg-[radial-gradient(ellipse_at_20%_0%,#a78bfa_0%,#382660_40%,#272133_100%)]",
    chipColor: "bg-white/20",
    isLiability: false,
  },
  crypto: {
    label: "Crypto",
    shortLabel: "CRY",
    icon: Bitcoin,
    // Vibrant amber/gold
    gradient:
      "bg-[radial-gradient(ellipse_at_70%_90%,#a09068_0%,#594514_40%,#1c0f01_100%)]",
    chipColor: "bg-white/20",
    isLiability: false,
  },
};

export const ACCOUNTS_TYPES_ICON_CHIP: Record<string, string> = {
  checking: "bg-blue-400/70",
  savings: "bg-emerald-400/70",
  credit: "bg-rose-700/50",
  investment: "bg-violet-400/70",
  crypto: "bg-amber-400/70",
};

export const SUGGESTED_SUBTYPES = [
  "Primary",
  "Bills",
  "Salary",
  "Emergency Fund",
  "Vacation",
  "Ajo",
  "Esusu",
  "FD",
  "Rewards",
  "Business",
  "Retirement",
  "ETF Portfolio",
  "Stocks",
  "DeFi",
  "HODL",
  "Trading",
] as const;

export const ACCOUNTS_LIMIT = 20;
