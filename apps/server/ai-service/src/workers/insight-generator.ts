// // ai-service/src/workers/insight-generator.ts

// export async function generateInsightsForUser(userId: string) {
//   // 1. Gather context — parallel where possible
//   const [currentMonthTxns, priorMonthTxns, categoryAverages, budgets, anomalies] =
//     await Promise.all([
//       getTransactionsByMonth(userId, currentMonth, currentYear),
//       getTransactionsByMonth(userId, priorMonth, priorYear),
//       getCategoryAverages(userId, 3), // 3-month rolling
//       getActiveBudgets(userId),
//       getAnomalousTransactions(userId, currentMonth),
//     ]);

//   // 2. Pre-compute derived data (never ask Claude to do math)
//   const context = {
//     user: await getUser(userId),
//     currentMonth: {
//       transactions: currentMonthTxns,
//       totalSpend: currentMonthTxns.reduce((s, t) => s + Number(t.amount), 0),
//     },
//     priorMonth: {
//       transactions: priorMonthTxns,
//       totalSpend: priorMonthTxns.reduce((s, t) => s + Number(t.amount), 0),
//     },
//     prior3Months: {
//       averageSpend: categoryAverages.overall,
//       byCategory: categoryAverages.byCategory,
//     },
//     budgets: budgets.map(b => ({
//       ...b,
//       spent: currentMonthTxns
//         .filter(t => t.category === b.category)
//         .reduce((s, t) => s + Number(t.amount), 0),
//     })),
//     anomalies: currentMonthTxns.filter(t => t.isAnomaly),
//   };

//   // 3. Call Claude
//   const response = await anthropic.messages.create({
//     model: "claude-sonnet-4", // or whatever you're using
//     max_tokens: 2000,
//     messages: [{ role: "user", content: buildInsightPrompt(context) }],
//   });

//   // 4. Parse and write
//   const parsed = JSON.parse(response.content[0].text);

//   await db.insert(insights).values(
//     parsed.insights.map((insight: any) => ({
//       userId,
//       type: insight.type,
//       severity: insight.severity,
//       category: insight.category,
//       title: insight.title,
//       description: insight.description,
//       data: JSON.stringify(insight.data),
//       generatedAt: new Date(),
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day TTL
//     }))
//   );

//   // 5. Push notifications for urgent ones
//   const urgent = parsed.insights.filter(
//     (i: any) => i.severity === "high" || i.severity === "critical"
//   );
//   if (urgent.length > 0) {
//     await notificationService.send(userId, urgent);
//   }
// }
