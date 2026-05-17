/**
 * Centralized React Query key factory
 * Ensures consistent query keys across the app for caching and invalidation
 */

export const queryKeys = {
  // ── AI Insights
  insights: {
    all: () => ["insights"] as const,
    lists: () => [...queryKeys.insights.all(), "list"] as const,
    list: (filters?: { limit?: number }) =>
      [...queryKeys.insights.lists(), { ...filters }] as const,
    details: () => [...queryKeys.insights.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.insights.details(), id] as const,
  },

  // ── Chat Sessions
  chat: {
    all: () => ["chat"] as const,
    sessions: () => [...queryKeys.chat.all(), "sessions"] as const,
    sessionList: () => [...queryKeys.chat.sessions()] as const,
    messages: () => [...queryKeys.chat.all(), "messages"] as const,
    messagesList: (sessionId: string) =>
      [...queryKeys.chat.messages(), sessionId] as const,
  },
} as const;

/**
 * Usage Examples:
 *
 * // Fetch insights
 * const { data } = useQuery({
 *   queryKey: queryKeys.insights.list({ limit: 10 }),
 *   queryFn: () => trpc.ai.insights.list.query({ limit: 10 }),
 * });
 *
 * // Fetch chat sessions
 * const { data } = useQuery({
 *   queryKey: queryKeys.chat.sessionList(),
 *   queryFn: () => trpc.ai.coach.sessions.query(),
 * });
 *
 * // Fetch messages for a session
 * const { data } = useQuery({
 *   queryKey: queryKeys.chat.messagesList(sessionId),
 *   queryFn: () => trpc.ai.coach.messages.query({ sessionId }),
 * });
 *
 * // Dismiss insight and invalidate cache
 * const mutation = useMutation({
 *   mutationFn: (id: string) => trpc.ai.insights.dismiss.mutate({ id }),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({
 *       queryKey: queryKeys.insights.lists(),
 *     });
 *   },
 * });
 *
 * // Send message and invalidate messages list
 * const mutation = useMutation({
 *   mutationFn: (payload) => trpc.ai.coach.sendMessage.mutate(payload),
 *   onSuccess: (_data, variables) => {
 *     queryClient.invalidateQueries({
 *       queryKey: queryKeys.chat.messagesList(variables.sessionId),
 *     });
 *   },
 * });
 *
 * // Archive session and invalidate sessions list
 * const mutation = useMutation({
 *   mutationFn: (sessionId: string) =>
 *     trpc.ai.coach.archiveSession.mutate({ sessionId }),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({
 *       queryKey: queryKeys.chat.sessionList(),
 *     });
 *   },
 * });
 */
