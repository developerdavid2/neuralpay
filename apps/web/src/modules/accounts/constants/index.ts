import {
  Bitcoin,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const ACCOUNT_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  active: {
    label: "Active",
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  disconnected: {
    label: "Disconnected",
    color:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

export const ACCOUNT_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    iconBg: string;
  }
> = {
  checking: {
    label: "Checking",
    shortLabel: "CHK",
    icon: Wallet,
    iconBg: "bg-blue-500 dark:bg-blue-400/70",
  },
  savings: {
    label: "Savings",
    shortLabel: "SAV",
    icon: PiggyBank,
    iconBg: "bg-emerald-500 dark:bg-emerald-400/70",
  },
  credit: {
    label: "Credit",
    shortLabel: "CRD",
    icon: CreditCard,
    iconBg: "bg-rose-800 dark:bg-rose-700/50",
  },
  investment: {
    label: "Investment",
    shortLabel: "INV",
    icon: TrendingUp,
    iconBg: "bg-violet-500 dark:bg-violet-400/70",
  },
  crypto: {
    label: "Crypto",
    shortLabel: "CRY",
    icon: Bitcoin,
    iconBg: "bg-yellow-500 dark:bg-yellow-400/70",
  },
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
