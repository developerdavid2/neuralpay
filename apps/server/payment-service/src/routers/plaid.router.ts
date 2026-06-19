import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PlaidService } from "../services/plaid.service";

export const plaidRouter = router({
  getConnectedBank: protectedProcedure.query(async ({ ctx }) => {
    return PlaidService.getConnectedBank(ctx.session.user.id);
  }),

  createLinkToken: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const token = await PlaidService.createLinkToken(ctx.session.user.id);
      return { linkToken: token };
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create link token",
      });
    }
  }),

  exchangePublicToken: protectedProcedure
    .input(z.object({ publicToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await PlaidService.exchangePublicToken(
          ctx.session.user.id,
          input.publicToken,
        );
        return { success: true };
      } catch (err) {
        console.error("[plaid.exchangePublicToken]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect bank",
        });
      }
    }),

  disconnectBank: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await PlaidService.disconnectBank(ctx.session.user.id);
    if (!result)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No connected bank found",
      });
    return result;
  }),

  syncTransactions: protectedProcedure.mutation(async ({ ctx }) => {
    const bank = await PlaidService.getConnectedBank(ctx.session.user.id);
    if (!bank)
      throw new TRPCError({ code: "NOT_FOUND", message: "No bank connected" });

    try {
      const result = await PlaidService.syncTransactions(
        ctx.session.user.id,
        bank.accessToken,
        bank.itemId!,
        bank.institutionName,
      );
      return result;
    } catch (err) {
      console.error("[plaid.syncTransactions]", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Sync failed",
      });
    }
  }),
});
