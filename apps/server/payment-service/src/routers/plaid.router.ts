import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PlaidService } from "../services/plaid.service";

export const plaidRouter = router({
  getConnectedBanks: protectedProcedure.query(async ({ ctx }) => {
    const banks = await PlaidService.getConnectedBanks(ctx.session.user.id);
    return banks.map(
      ({ accessToken, itemId, transactionCursor, ...safe }) => safe,
    );
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
        console.error(
          "[plaid.exchangePublicToken] failed",
          err instanceof Error ? err.message : err,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect bank",
        });
      }
    }),

  disconnectBankById: protectedProcedure
    .input(z.object({ bankId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await PlaidService.disconnectBankById(
        ctx.session.user.id,
        input.bankId,
      );
      if (!result)
        throw new TRPCError({ code: "NOT_FOUND", message: "Bank not found" });
      return result;
    }),

  toggleInstitutionAccounts: protectedProcedure
    .input(
      z.object({
        bankId: z.string(),
        status: z.enum(["active", "inactive"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await PlaidService.toggleInstitutionAccounts(
        ctx.session.user.id,
        input.bankId,
        input.status,
      );
      if (!result)
        throw new TRPCError({ code: "NOT_FOUND", message: "Bank not found" });
      return result;
    }),

  syncTransactionsById: protectedProcedure
    .input(z.object({ bankId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const banks = await PlaidService.getConnectedBanks(ctx.session.user.id);
      const bank = banks.find((b) => b.id === input.bankId);
      if (!bank)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No bank connected",
        });

      try {
        return await PlaidService.syncTransactions(
          ctx.session.user.id,
          bank.accessToken,
          bank.itemId!,
          bank.institutionName,
        );
      } catch (err) {
        console.error("[plaid.syncTransactionsById]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Sync failed",
        });
      }
    }),
});
