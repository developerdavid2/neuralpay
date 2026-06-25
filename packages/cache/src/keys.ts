export const cacheKeys = {
  accounts: {
    list: (userId: string, filters?: string) =>
      `accounts:list:${userId}${filters ? `:${filters}` : ""}`,
    byId: (accountId: string, userId: string) =>
      `accounts:byId:${accountId}:${userId}`,
    listAll: (userId: string, filters?: string) =>
      `accounts:listAll:${userId}${filters ? `:${filters}` : ""}`,
    aggregate: (userId: string) => `accounts:aggregate:${userId}`,
    totalBalance: (userId: string) => `accounts:totalBalance:${userId}`,
  },

  transactions: {
    list: (userId: string, filters?: string) =>
      `transactions:list:${userId}${filters ? `:${filters}` : ""}`,
    recent: (userId: string, limit?: number) =>
      `transactions:recent:${userId}:${limit || 7}`,
    byId: (txId: string, userId: string) =>
      `transactions:byId:${txId}:${userId}`,
    spendingOverview: (userId: string, period: string) =>
      `transactions:overview:${userId}:${period}`,
    topCategories: (userId: string, month: number, year: number) =>
      `transactions:topCats:${userId}:${year}-${month}`,
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
