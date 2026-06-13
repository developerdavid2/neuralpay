import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  transactionsFilterSchema,
  createTransactionSchema,
  updateTransactionSchema,
  batchDeleteSchema,
  csvColumnMappingSchema,
} from "@neuralpay/types";
import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TransactionsService } from "../services/transactions.service";
import { CSVService } from "../services/csv.service";

export const transactionsRouter = router({
  list: protectedProcedure
    .input(transactionsFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = transactionsFilterSchema.parse(input ?? {});
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
        .object({ limit: z.number().int().min(1).max(20).default(7) })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.recent(
        ctx.session.user.id,
        input?.limit ?? 7,
      );
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  getById: protectedProcedure
    .input(z.object({ transactionId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.getById(
        input.transactionId,
        ctx.session.user.id,
      );
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await TransactionsService.create(
        ctx.session.user.id,
        input,
      );
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await TransactionsService.update(
        ctx.session.user.id,
        input,
      );
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await TransactionsService.delete(
        input.id,
        ctx.session.user.id,
      );
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  batchDelete: protectedProcedure
    .input(batchDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await TransactionsService.batchDelete(
        ctx.session.user.id,
        input,
      );
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  // Preview CSV before committing — returns parsed rows, no DB write
  previewCsv: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        rows: z.array(z.array(z.string())).max(10000),
        mapping: csvColumnMappingSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const result = await CSVService.previewCsv(
        input.filename,
        input.rows,
        input.mapping,
      );
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  // Commit the import — writes to DB
  importCsv: protectedProcedure
    .input(
      z.object({
        bankAccountId: z.uuid(),
        filename: z.string(),
        rows: z.array(z.array(z.string())).max(10000),
        mapping: csvColumnMappingSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await CSVService.importCsv(
        ctx.session.user.id,
        input.bankAccountId,
        input.filename,
        input.rows,
        input.mapping,
      );
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
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
              message: "`from` and `to` required for custom period",
              path: ["period"],
            });
          }
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await TransactionsService.getSpendingOverview(
        ctx.session.user.id,
        input ?? { period: "30d" },
      );
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
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
      if (!result.success)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  currentMonthSpending: protectedProcedure.query(async ({ ctx }) => {
    const result = await TransactionsService.getCurrentMonthSpending(
      ctx.session.user.id,
    );
    if (!result.success)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    return result.data;
  }),
});
