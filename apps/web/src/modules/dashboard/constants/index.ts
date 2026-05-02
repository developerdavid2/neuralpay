import {
  ArrowLeftRight,
  Bell,
  BrainCircuit,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
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
