import { TRPCError } from "@trpc/server";
import { AIService } from "../../services/ai/ai.service";
import { protectedProcedure, router } from "../../../../config/src/trpc";
import z from "zod";
import { sendMessageSchema } from "@neuralpay/types";

// ── Coach Chat ────────────────────────────────────────────────────────────
export const coachRouter = router({
  sessions: protectedProcedure.query(async ({ ctx }) => {
    const result = await AIService.getSessions(ctx.session.user.id);
    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),

  messages: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await AIService.getMessages(
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

  // Claude integration goes here — placeholder returns mock for now
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1. Get or create session
      const sessionResult = await AIService.getOrCreateSession(
        userId,
        input.sessionId,
      );
      if (!sessionResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: sessionResult.error,
        });
      }
      const session = sessionResult.data;

      // 2. Save user message
      const userMsgResult = await AIService.saveMessage(
        session.id,
        userId,
        "user",
        input.message,
      );
      if (!userMsgResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: userMsgResult.error,
        });
      }

      // 3. TODO: call Claude here — for now return mock
      // const claudeResponse = await callClaude(input.message, history);
      const mockReply =
        "I can see your spending patterns. Your biggest category this month is food & dining at $340. " +
        "Would you like me to suggest a budget for next month?";

      // 4. Save assistant message
      const assistantMsgResult = await AIService.saveMessage(
        session.id,
        userId,
        "assistant",
        mockReply,
        80, // mock token count
      );
      if (!assistantMsgResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: assistantMsgResult.error,
        });
      }

      return {
        sessionId: session.id,
        userMessage: userMsgResult.data,
        assistantMessage: assistantMsgResult.data,
      };
    }),
});
