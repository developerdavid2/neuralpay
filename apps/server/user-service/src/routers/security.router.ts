import { z } from "zod";
import { protectedProcedure, router } from "@neuralpay/config/trpc";
import { SecurityService } from "../services/security.service";
import {
  changePasswordSchema,
  verify2FASchema,
  disable2FASchema,
  revokeSessionSchema,
} from "@neuralpay/types";
import { TRPCError } from "@trpc/server";

export const securityRouter = router({
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(({ input, ctx }) =>
      SecurityService.changePassword(
        ctx.session.user.id,
        input.currentPassword,
        input.newPassword,
        ctx._headers,
      ),
    ),

  getSessions: protectedProcedure.query(async ({ ctx }) => {
    const result = await SecurityService.getSessions(ctx._headers);

    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),

  revokeSession: protectedProcedure
    .input(revokeSessionSchema)
    .mutation(({ input, ctx }) =>
      SecurityService.revokeSession(input.sessionToken, ctx._headers),
    ),

  revokeOtherSessions: protectedProcedure.mutation(() =>
    SecurityService.revokeOtherSessions(),
  ),

  get2FAStatus: protectedProcedure.query(async ({ ctx }) => {
    const result = await SecurityService.get2FAStatus(ctx.session.user.id);
    if (!result.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error,
      });
    }
    return result.data;
  }),

  enable2FA: protectedProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(({ input, ctx }) =>
      SecurityService.enable2FA(input.password, ctx._headers),
    ),

  verify2FA: protectedProcedure
    .input(verify2FASchema)
    .mutation(({ input, ctx }) =>
      SecurityService.verify2FA(input.code, ctx._headers),
    ),

  disable2FA: protectedProcedure
    .input(disable2FASchema)
    .mutation(({ input, ctx }) =>
      SecurityService.disable2FA(input.password, ctx._headers),
    ),

  getBackupCodes: protectedProcedure.query(({ ctx }) =>
    SecurityService.getBackupCodes(ctx.session.user.id),
  ),
});
