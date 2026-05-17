import { useState, useCallback } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc-client";

export function useChat(initialSessionId?: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get or create session
  const sessionQuery = useSuspenseQuery(
    trpc.ai.coach.sessionById.queryOptions(
      { sessionId: initialSessionId ?? "" },
      { enabled: !!initialSessionId },
    ),
  );

  // Start new session mutation
  const startSessionMutation = useMutation({
    ...trpc.ai.coach.startSession.mutationOptions(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: trpc.ai.coach.sessions.queryKey(),
      });
      // Navigate to new session
      window.history.replaceState(null, "", `/dashboard/ai-chat/${data.id}`);
    },
  });

  // Send message mutation
  //   const sendMessageMutation = useMutation({
  //     ...trpc.ai.coach.sendMessage.mutationOptions(),
  //     onMutate: async (variables) => {
  //       // Add optimistic user message
  //       const optimisticUserMessage = {
  //         id: `optimistic-user-${Date.now()}`,
  //         role: "user" as const,
  //         content: variables.content,
  //         createdAt: new Date(),
  //       };
  //       setOptimisticMessages((prev) => [...prev, optimisticUserMessage]);
  //       return { optimisticUserMessage };
  //     },
  //     onSuccess: (data) => {
  //       // Clear optimistic messages and invalidate
  //       setOptimisticMessages([]);
  //       queryClient.invalidateQueries({
  //         queryKey: trpc.ai.coach.sessionById.queryKey({
  //           sessionId: data.userMessage.sessionId,
  //         }),
  //       });
  //     },
  //     onError: (_err, _variables, context) => {
  //       // Remove optimistic message on error
  //       if (context?.optimisticUserMessage) {
  //         setOptimisticMessages((prev) =>
  //           prev.filter((m) => m.id !== context.optimisticUserMessage.id),
  //         );
  //       }
  //     },
  //   });

  //   const sendMessage = useCallback(
  //     (content: string) => {
  //       if (!sessionQuery.data?.session.id) {
  //         // Need to create session first
  //         startSessionMutation.mutate(
  //           { contextType: "general", topic: "general" },
  //           {
  //             onSuccess: (session) => {
  //               sendMessageMutation.mutate({
  //                 sessionId: session.id,
  //                 content,
  //               });
  //             },
  //           },
  //         );
  //         return;
  //       }

  //       sendMessageMutation.mutate({
  //         sessionId: sessionQuery.data.session.id,
  //         content,
  //       });
  //     },
  //     [sessionQuery.data, startSessionMutation, sendMessageMutation],
  //   );

  // Combine server messages with optimistic ones
  const messages = sessionQuery.data?.messages ?? [];
  //   const allMessages = [...messages, ...optimisticMessages];

  return {
    session: sessionQuery.data?.session,
    // messages: allMessages,
    isLoading: sessionQuery.isLoading,
    // isSending: sendMessageMutation.isPending || startSessionMutation.isPending,
    // sendMessage,
    startSession: startSessionMutation.mutate,
  };
}
