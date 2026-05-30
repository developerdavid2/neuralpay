import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AccountsService } from "../services/accounts.service";
import { accountsFilterSchema } from "@neuralpay/types";

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

  disconnect: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AccountsService.disconnect(
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
