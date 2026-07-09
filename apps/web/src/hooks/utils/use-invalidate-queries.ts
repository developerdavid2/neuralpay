"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useInvalidateQueries() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return {
    //Profile
    invalidateProfile: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    // Accounts
    invalidateAccounts: () =>
      queryClient.invalidateQueries(trpc.payments.accounts.pathFilter()),

    // Transactions + Insights
    invalidateTransactions: async () => {
      await Promise.all([
        queryClient.invalidateQueries(trpc.payments.transactions.pathFilter()),
        queryClient.invalidateQueries(trpc.ai.insights.pathFilter()),
      ]);
    },

    // Insights
    invalidateInsights: () =>
      queryClient.invalidateQueries(trpc.ai.insights.pathFilter()),

    // Chat sessions list
    invalidateChats: () =>
      queryClient.invalidateQueries(trpc.ai.coach.sessions.pathFilter()),

    // Single chat session
    invalidateChatSession: async () => {
      await Promise.all([
        queryClient.invalidateQueries(trpc.ai.coach.sessionById.pathFilter()),
        queryClient.invalidateQueries(trpc.ai.coach.getMessages.pathFilter()),
      ]);
    },

    // Plaid
    invalidatePlaid: () =>
      queryClient.invalidateQueries(trpc.payments.plaid.pathFilter()),

    // Everything under payments
    invalidatePayments: async () => {
      await Promise.all([
        queryClient.invalidateQueries(trpc.payments.pathFilter()),
        queryClient.invalidateQueries(trpc.ai.insights.pathFilter()),
      ]);
    },

    //Notifications:
    invalidateNotifications: () =>
      queryClient.invalidateQueries(
        trpc.notifications.appNotifications.pathFilter(),
      ),

    invalidateNotificationPreferences: () =>
      queryClient.invalidateQueries(
        trpc.notifications.appNotifications.getPreferences.pathFilter(),
      ),
  };
}
