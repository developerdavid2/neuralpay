import {
  Bell,
  Code,
  CreditCard,
  Landmark,
  Shield,
  Trash2,
  User,
} from "lucide-react";

export const settingsSections = [
  {
    title: "Personal",
    items: [
      {
        href: "/dashboard/settings",
        label: "General",
        icon: User,
        exact: true,
        danger: false,
      },
      {
        href: "/dashboard/settings/security",
        label: "Security",
        icon: Shield,
        danger: false,
      },
      {
        href: "/dashboard/settings/notifications",
        label: "Notifications",
        icon: Bell,
        danger: false,
      },
    ],
  },
  {
    title: "Financial",
    items: [
      {
        href: "/dashboard/settings/connected-banks",
        label: "Connected Banks",
        icon: Landmark,
        danger: false,
      },
      {
        href: "/dashboard/settings/billing",
        label: "Billing",
        icon: CreditCard,
        danger: false,
      },
    ],
  },
  {
    title: "Danger Zone",
    items: [
      {
        href: "/dashboard/settings/delete-account",
        label: "Delete Account",
        icon: Trash2,
        danger: true,
      },
    ],
  },
] as const;
