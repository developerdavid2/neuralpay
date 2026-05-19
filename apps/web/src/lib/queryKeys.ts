export const queryKeys = {
  //  AI Insights
  insights: {
    all: () => ["insights"] as const,
    lists: () => [...queryKeys.insights.all(), "list"] as const,
    recent: () => [...queryKeys.insights.all(), "recent"] as const,
    details: () => [...queryKeys.insights.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.insights.details(), id] as const,
  },

  //  Chat Sessions
  chat: {
    all: () => ["chat"] as const,
    sessions: () => [...queryKeys.chat.all(), "sessions"] as const,
    sessionList: () => [...queryKeys.chat.sessions()] as const,
    messages: () => [...queryKeys.chat.all(), "messages"] as const,
    messagesList: (sessionId: string) =>
      [...queryKeys.chat.messages(), sessionId] as const,
  },
} as const;
