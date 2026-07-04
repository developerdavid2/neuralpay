import type { NotificationCategory } from "@neuralpay/types";
import {
  Bell,
  Brain,
  Calendar,
  CreditCard,
  Landmark,
  PiggyBank,
  ShieldBanIcon,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  transaction: CreditCard,
  budget: Wallet,
  account: Landmark,
  security: ShieldBanIcon,
  split: Users,
  vault: PiggyBank,
  ai: Brain,
  subscription: Calendar,
  system: Bell,
};

export const categoryColors: Record<NotificationCategory, string> = {
  transaction: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  budget: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  account: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  security: "text-neutral-500 bg-neutral-50 dark:bg-neutral-950/30",
  split: "text-violet-500 bg-violet-50 dark:bg-violet-950/30",
  vault: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30",
  ai: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
  subscription: "text-orange-500 bg-orange-50 dark:bg-orange-950/30",
  system: "text-slate-500 bg-slate-50 dark:bg-slate-950/30",
};

export const categoryLabels: Record<NotificationCategory, string> = {
  transaction: "Transaction",
  budget: "Budget",
  account: "Account",
  security: "Security",
  split: "Split",
  vault: "Vault",
  ai: "AI Insight",
  subscription: "Subscription",
  system: "System",
};
