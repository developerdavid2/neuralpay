import { protectedProcedure, router } from "@neuralpay/config/trpc";
import {
  listSessionsInputSchema,
  startChatSessionSchema,
} from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { AICoachService } from "../services/coach.service";

export const coachRouter = router({
  //  * Used by: AI Chat sidebar
  sessions: protectedProcedure
    .input(listSessionsInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = listSessionsInputSchema.parse(input ?? {});

      const result = await AICoachService.getSessions(
        ctx.session.user.id,
        parsed,
      );
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  //  * Used by: Opening a chat session
  sessionById: protectedProcedure
    .input(startChatSessionSchema.pick({ sessionId: true }))
    .query(async ({ ctx, input }) => {
      const sessionResult = await AICoachService.getOrCreateSession(
        ctx.session.user.id,
        { sessionId: input.sessionId },
      );
      if (!sessionResult.success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: sessionResult.error,
        });
      }

      const messagesResult = await AICoachService.getMessages(
        sessionResult.data.id,
        ctx.session.user.id,
      );
      if (!messagesResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: messagesResult.error,
        });
      }

      return {
        session: sessionResult.data,
        messages: messagesResult.data,
      };
    }),

  //  * Used by: "Chat about this" from insight, new general chat
  startSession: protectedProcedure
    .input(startChatSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await AICoachService.getOrCreateSession(
        ctx.session.user.id,
        {
          contextType: input.contextType,
          contextId: input.contextId,
          title: input.title,
          topic: input.topic,
        },
      );
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }
      return result.data;
    }),

  //  * Send message and get AI response
  //  * Used by: Chat input

  // sendMessage: protectedProcedure
  //   .input(sendMessageSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // 1. Verify session belongs to user
  //     const sessionResult = await AICoachService.getOrCreateSession(
  //       ctx.session.user.id,
  //       { sessionId: input.sessionId },
  //     );
  //     if (!sessionResult.success) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: sessionResult.error,
  //       });
  //     }

  //     // 2. Check rate limit
  //     const quotaResult = await AICoachService.checkQuota(
  //       ctx.session.user.id,
  //       ctx.session.user.planTier ?? "free",
  //     );
  //     if (!quotaResult.success) {
  //       throw new TRPCError({
  //         code: "TOO_MANY_REQUESTS",
  //         message: quotaResult.error,
  //       });
  //     }

  //     // 3. Save user message
  //     const userMessageResult = await AICoachService.saveMessage(
  //       input.sessionId,
  //       ctx.session.user.id,
  //       "user",
  //       input.content,
  //     );
  //     if (!userMessageResult.success) {
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: userMessageResult.error,
  //       });
  //     }

  //     // 4. TODO: Call GROQ API for AI response
  //     // For now, return placeholder
  //     const aiResponse =
  //       "I'm your NeuralPay AI Coach. I can help you understand this insight and suggest actions. (GROQ integration pending)";
  //     const tokensUsed = 0;

  //     // 5. Save AI response
  //     const aiMessageResult = await AICoachService.saveMessage(
  //       input.sessionId,
  //       ctx.session.user.id,
  //       "assistant",
  //       aiResponse,
  //       tokensUsed,
  //     );
  //     if (!aiMessageResult.success) {
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: aiMessageResult.error,
  //       });
  //     }

  //     // 6. Update usage
  //     await AICoachService.incrementAIUsage(ctx.session.user.id, tokensUsed);

  //     return {
  //       userMessage: userMessageResult.data,
  //       aiMessage: aiMessageResult.data,
  //     };
  //   }),

  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AICoachService.deleteSession(
        input.sessionId,
        ctx.session.user.id,
      );
      if (!result.success) {
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  archiveSession: protectedProcedure
    .input(z.object({ sessionId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AICoachService.archiveSession(
        input.sessionId,
        ctx.session.user.id,
      );
      if (!result.success) {
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  /**
   * Get current month's AI usage
   * Used by: Displaying quota in chat UI
   */
  usage: protectedProcedure.query(async ({ ctx }) => {
    const result = await AICoachService.getUsage(ctx.session.user.id);
    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),
});
