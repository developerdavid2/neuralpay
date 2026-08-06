import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BudgetsService } from "../services/budgets.service";
import {
  budgetsFilterSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "@neuralpay/types";

function toTrpcCode(code?: string) {
  switch (code) {
    case "NOT_FOUND":
      return "NOT_FOUND" as const;
    case "FORBIDDEN":
      return "FORBIDDEN" as const;
    case "BAD_REQUEST":
    case "VALIDATION_ERROR":
      return "BAD_REQUEST" as const;
    default:
      return "INTERNAL_SERVER_ERROR" as const;
  }
}

export const budgetsRouter = router({
  list: protectedProcedure
    .input(budgetsFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = budgetsFilterSchema.parse(input ?? {});
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

  summary: protectedProcedure.query(async ({ ctx }) => {
    const result = await BudgetsService.getSummary(ctx.session.user.id);
    if (!result.success)
      throw new TRPCError({
        code: toTrpcCode(result.code),
        message: result.error,
      });
    return result.data;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await BudgetsService.getById(input.id, ctx.session.user.id);
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
    .input(z.object({ id: z.uuid() }))
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
