import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AccountsService } from "../services/accounts.service";
import {
  accountsFilterSchema,
  accountsListAllSchema,
  createAccountSchema,
  updateAccountSchema,
} from "@neuralpay/types";

export const accountsRouter = router({
  list: protectedProcedure
    .input(accountsFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = accountsFilterSchema.parse(input ?? {});
      const result = await AccountsService.listByUser(
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

  listAll: protectedProcedure
    .input(accountsListAllSchema.optional())
    .query(async ({ ctx, input }) => {
      const parsed = accountsListAllSchema.parse(input ?? {});
      const result = await AccountsService.listAllByUser(
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

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await AccountsService.getById(
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

  create: protectedProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await AccountsService.create(ctx.session.user.id, input);
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await AccountsService.update(ctx.session.user.id, input);
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
      const result = await AccountsService.delete(
        input.id,
        ctx.session.user.id,
      );
      if (!result.success)
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND"
              ? "NOT_FOUND"
              : result.code === "FORBIDDEN"
                ? "FORBIDDEN"
                : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      return result.data;
    }),

  aggregateByType: protectedProcedure.query(async ({ ctx }) => {
    const result = await AccountsService.getAggregateBalanceByType(
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

  totalBalance: protectedProcedure.query(async ({ ctx }) => {
    const result = await AccountsService.getTotalBalance(ctx.session.user.id);
    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),

  toggleStatus: protectedProcedure
    .input(z.object({ id: z.uuid(), status: z.enum(["active", "inactive"]) }))
    .mutation(async ({ ctx, input }) => {
      const result = await AccountsService.toggleStatus(
        input.id,
        ctx.session.user.id,
        input.status,
      );
      if (!result.success) {
        throw new TRPCError({
          code:
            result.code === "NOT_FOUND"
              ? "NOT_FOUND"
              : result.code === "FORBIDDEN"
                ? "FORBIDDEN"
                : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),
});
