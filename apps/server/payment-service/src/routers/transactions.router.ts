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

      console.log("TRPC input received:", parsed);

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
    .input(z.object({ id: z.string().uuid() }))
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

  spendingByCategory: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.getSpendingByCategory(
        ctx.session.user.id,
        input.month,
        input.year,
      );
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  monthlySpending: protectedProcedure.query(async ({ ctx }) => {
    const result = await TransactionsService.getMonthlySpending(
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
