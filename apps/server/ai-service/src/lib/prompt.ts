// // ai-service/src/lib/prompts.ts

// export function buildInsightPrompt(context: {
//   user: { name: string };
//   currentMonth: { transactions: Transaction[]; totalSpend: number };
//   priorMonth:   { transactions: Transaction[]; totalSpend: number };
//   prior3Months: { averageSpend: number; byCategory: CategoryTotal[] };
//   budgets:      Budget[];
//   anomalies:    Transaction[];
// }) {
//   return `
// You are a personal finance AI coach. Analyse this user's spending and generate 3-5 specific, actionable insights.

// USER: ${context.user.name}
// CURRENT MONTH: $${context.currentMonth.totalSpend} (${context.currentMonth.transactions.length} transactions)
// PRIOR MONTH: $${context.priorMonth.totalSpend}
// 3-MONTH AVERAGE: $${context.prior3Months.averageSpend}

// SPENDING BY CATEGORY (current vs 3-month avg):
// ${context.prior3Months.byCategory.map(cat =>
//   `- ${cat.category}: $${cat.current} vs avg $${cat.average} (${cat.change > 0 ? '+' : ''}${cat.change}%)`
// ).join('\n')}

// BUDGET STATUS:
// ${context.budgets.map(b =>
//   `- ${b.category}: $${b.spent} / $${b.limit} (${Math.round(b.spent/b.limit*100)}%)`
// ).join('\n')}

// FLAGGED ANOMALIES:
// ${context.anomalies.map(tx =>
//   `- ${tx.merchant ?? tx.description}: $${tx.amount} (score: ${tx.anomalyScore})`
// ).join('\n')}

// RULES:
// - Use ONLY the data provided. Never hallucinate numbers.
// - Be specific: name merchants, state exact amounts, compare to their history.
// - Every insight must include a concrete action.
// - Prioritise: (1) budget breaches, (2) anomalies, (3) trends vs historical avg.

// Return ONLY valid JSON:
// {
//   "insights": [
//     {
//       "type": "anomaly" | "opportunity" | "trend" | "saving" | "warning",
//       "severity": "low" | "medium" | "high" | "critical",
//       "category": "food_dining" | "shopping" | ... | null,
//       "title": "Max 60 chars",
//       "description": "Specific insight with real numbers + concrete action",
//       "data": { "savingsOpportunity": 120, "affectedTransactions": ["tx-id-1"] }
//     }
//   ]
// }
// `.trim();
// }
