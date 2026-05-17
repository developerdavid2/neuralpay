import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { listTransactionsInputSchema } from "@neuralpay/types";
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

  spendingOverview: protectedProcedure
    .input(
      z
        .object({
          period: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
          from: z.string().datetime().optional(),
          to: z.string().datetime().optional(),
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
