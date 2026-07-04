export const cacheKeys = {
  accounts: {
    aggregate: (userId: string) => `accounts:aggregate:${userId}`,
    totalBalance: (userId: string) => `accounts:totalBalance:${userId}`,
  },

  transactions: {
    spendingOverview: (userId: string, period: string) =>
      `transactions:overview:${userId}:${period}`,
    topCategories: (userId: string, month: number, year: number) =>
      `transactions:topCats:${userId}:${year}-${month}`,
    monthSpend: (userId: string, year: number, month: number) =>
      `transactions:monthSpend:${userId}:${year}-${month}`,
    monthlySummaries: (userId: string, filters: string) =>
      `transactions:monthlySummaries:${userId}:${filters}`,

    patterns: {
      overview: (userId: string) => `transactions:overview:${userId}*`,
      topCats: (userId: string) => `transactions:topCats:${userId}*`,
      monthSpend: (userId: string) => `transactions:monthSpend:${userId}*`,
      monthlySummaries: (userId: string) =>
        `transactions:monthlySummaries:${userId}*`,
    },
  },

  plaid: {
    connectedBank: (userId: string) => `plaid:connected:${userId}`,
    accounts: (userId: string) => `plaid:accounts:${userId}`,
  },

  ai: {
    insights: (userId: string) => `ai:insights:${userId}`,
    chatSession: (sessionId: string) => `ai:chat:${sessionId}`,
  },

  user: {
    profile: (userId: string) => `user:profile:${userId}`,
    preferences: (userId: string) => `user:prefs:${userId}`,
  },
} as const;
