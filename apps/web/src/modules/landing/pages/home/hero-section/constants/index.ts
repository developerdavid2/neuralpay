import { LANDING_THEME } from "../../../constants/theme";

export const MOCK_TIME_SERIES = [
  { name: "Mon", val: 120 },
  { name: "Tue", val: 240 },
  { name: "Wed", val: 180 },
  { name: "Thu", val: 320 },
  { name: "Fri", val: 290 },
  { name: "Sat", val: 410 },
  { name: "Sun", val: 380 },
];

export const MOCK_PIE = [
  { name: "Food", val: 35, color: LANDING_THEME.violet500 },
  { name: "Bills", val: 25, color: LANDING_THEME.indigo },
  { name: "Tech", val: 20, color: "#a78bfa" },
  { name: "Travel", val: 20, color: "#f0b100" },
];

export const TRANSACTIONS = [
  {
    id: "tx-1",
    name: "Payment Received",
    source: "NeuralPay Network",
    time: "Just now",
    amount: "+$1,250.00",
    icon: "⚡",
    bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "tx-2",
    name: "AI Yield Distribution",
    source: "Vault #09",
    time: "2m ago",
    amount: "+$84.12",
    icon: "🤖",
    bg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "tx-3",
    name: "Settlement Cleared",
    source: "Stripe Connect",
    time: "5m ago",
    amount: "+$420.00",
    icon: "💳",
    bg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
];
