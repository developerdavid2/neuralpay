import { protectedProcedure, router, toTrpcCode } from "@neuralpay/config/trpc";
import {
  budgetsListInputSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BudgetsService } from "../services/budgets.service";

export const budgetsRouter = router({
  list: protectedProcedure
    .input(budgetsListInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = budgetsListInputSchema.parse(input ?? {});
      const result = await BudgetsService.listByUser(
        ctx.session.user.id,
        parsed,
      );
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  monthlyStats: protectedProcedure
    .input(
      z
        .object({
          month: z.number().int().min(1).max(12).optional(),
          year: z.number().int().min(2000).max(2100).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await BudgetsService.getMonthlyStats(
        ctx.session.user.id,
        input?.month,
        input?.year,
      );
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  calendar: protectedProcedure
    .input(
      z.object({
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2000).max(2100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await BudgetsService.getCalendarData(
        ctx.session.user.id,
        input.month,
        input.year,
      );
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await BudgetsService.getById(
        input.id,
        ctx.session.user.id,
      );
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  create: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await BudgetsService.create(ctx.session.user.id, input);
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  update: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await BudgetsService.update(ctx.session.user.id, input);
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await BudgetsService.delete(input.id, ctx.session.user.id);
      if (!result.success)
        throw new TRPCError({
          code: toTrpcCode(result.code),
          message: result.error,
        });
      return result.data;
    }),
});
