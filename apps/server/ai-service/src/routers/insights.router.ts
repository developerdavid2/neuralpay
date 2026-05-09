import {
  router,
  protectedProcedure,
  publicProcedure,
} from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AIService } from "../services/ai.service";

export const insightsRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "ai-service" })),
  list: protectedProcedure
    .input(
      z
        .object({ limit: z.number().int().min(1).max(50).default(10) })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await AIService.getInsights(
        ctx.session.user.id,
        input?.limit,
      );
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AIService.dismissInsight(
        input.id,
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
});
