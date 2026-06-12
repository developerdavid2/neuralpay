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

export function buildSystemPrompt(
  contextData: unknown,
  contextType: string,
): string {
  const basePrompt = `You are NeuralPay AI Coach, a highly capable financial assistant. You help users understand their spending, budgets, savings, and financial health.

CRITICAL RULES:
- Be concise but thorough. Use markdown tables for comparisons.
- Always base answers on the user's actual data provided below.
- If you don't have enough data, say so clearly.
- Never make up numbers. If data is missing, say "I don't have that information."
- For spending analysis, always compare to previous periods when relevant.
- Suggest actionable next steps when appropriate.
- Current date: ${new Date().toISOString().split("T")[0]}`;

  const contextPrompt = `\n\n--- USER'S FINANCIAL CONTEXT ---\nContext Type: ${contextType}\n${JSON.stringify(contextData, null, 2)}\n--- END CONTEXT ---`;

  return basePrompt + contextPrompt;
}
