import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@neuralpay/config/trpc";
import { listInsightsInputSchema } from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AIInsightsService } from "../services/insights.service";

export const insightsRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "ai-service" })),
  //  * Used by: AI Insights page (/dashboard/ai-insights)
  list: protectedProcedure
    .input(listInsightsInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = listInsightsInputSchema.parse(input ?? {});

      const result = await AIInsightsService.getInsights(
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

  //  * Used by: Dashboard insights summary
  recent: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).default(3),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await AIInsightsService.getRecentInsights(
        ctx.session.user.id,
        input?.limit ?? 3,
      );
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  //  * Get single insight by ID
  getInsightById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await AIInsightsService.getInsightById(
        ctx.session.user.id,
        input.id,
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

  //  * Used by: Dashboard dismiss button, AI insights page archive action
  dismiss: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AIInsightsService.dismissInsight(
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

  //  * Used by: AI insights page (archived filter view)
  restore: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AIInsightsService.restoreInsight(
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

  //  * Used by: Opening insight detail drawer
  markRead: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AIInsightsService.markInsightRead(
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
