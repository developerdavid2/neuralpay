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
  { name: "Tech", val: 20, color: LANDING_THEME.bg },
  { name: "Travel", val: 20, color: "#ceb861" },
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

export const AGENT_SCENARIOS = [
  {
    prompt: "How much did I spend dining out this week?",
    response:
      "You spent $184.50 across 4 places. That's 12% lower than last week!",
    tags: [
      { label: "Uber Eats", amount: "-$42.10", color: "text-white" },
      { label: "Starbucks", amount: "-$14.20", color: "text-chart-3" },
    ],
  },
  {
    prompt: "Split last night's $120 dinner bill with Alex & Sarah.",
    response:
      "Requested $40.00 each via Neural Pay split. Links sent automatically.",
    tags: [
      { label: "Alex (Pending)", amount: "+$40.00", color: "text-white" },
      {
        label: "Sarah (Cleared)",
        amount: "+$40.00",
        color: "text-emerald-400",
      },
    ],
  },
  {
    prompt: "Explain the $420 transaction from Stripe Connect.",
    response:
      "Software payout from Vault #09. Automatically allocated 20% to taxes.",
    tags: [
      { label: "Liquid Core", amount: "+$336.00", color: "text-white" },
      { label: "Tax Vault", amount: "-$84.00", color: "text-emerald-400" },
    ],
  },
];
