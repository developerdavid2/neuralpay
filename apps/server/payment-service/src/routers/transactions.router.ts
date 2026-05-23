import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  listTransactionsInputSchema,
  updateTransactionInputSchema,
} from "@neuralpay/types";
import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TransactionsService } from "../services/transactions.service";

export const transactionsRouter = router({
  list: protectedProcedure
    .input(listTransactionsInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = listTransactionsInputSchema.parse(input ?? {});

      const result = await TransactionsService.list(
        ctx.session.user.id,
        parsed,
      );

      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });

      return result.data;
    }),

  recent: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).default(7),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.recent(
        ctx.session.user.id,
        input?.limit ?? 3,
      );

      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });

      return result.data;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.getById(
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

  update: protectedProcedure
    .input(updateTransactionInputSchema.optional())
    .mutation(async ({ ctx, input }) => {
      const parsed = updateTransactionInputSchema.parse(input ?? {});
      const result = await TransactionsService.update(
        ctx.session.user.id,
        parsed,
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

  spendingOverview: protectedProcedure
    .input(
      z
        .object({
          period: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
          from: z.iso.datetime().optional(),
          to: z.iso.datetime().optional(),
        })
        .superRefine((val, ctx) => {
          if (val.period === "custom" && (!val.from || !val.to)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "`from` and `to` are required when period is custom",
              path: ["period"],
            });
          }
          if (val.from && val.to && new Date(val.from) > new Date(val.to)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "`from` must be <= `to`",
              path: ["from"],
            });
          }
        }),
    )
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.getSpendingOverview(
        ctx.session.user.id,
        input,
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),

  topCategories: protectedProcedure
    .input(
      z
        .object({
          month: z
            .number()
            .int()
            .min(1)
            .max(12)
            .default(() => new Date().getMonth() + 1),
          year: z
            .number()
            .int()
            .min(2020)
            .max(2100)
            .default(() => new Date().getFullYear()),
          limit: z.number().int().min(1).max(10).default(5),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const result = await TransactionsService.getTopCategories(
        ctx.session.user.id,
        input?.month ?? now.getMonth() + 1,
        input?.year ?? now.getFullYear(),
        input?.limit ?? 5,
      );
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  currentMonthSpending: protectedProcedure.query(async ({ ctx }) => {
    const result = await TransactionsService.getCurrentMonthSpending(
      ctx.session.user.id,
    );
    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),
});
