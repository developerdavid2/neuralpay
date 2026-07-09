import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@neuralpay/config/trpc";
import { updateProfileSchema } from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import { UsersService } from "../services/users.service";

export const profileRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "user-service" })),

  me: protectedProcedure.query(async ({ ctx }) => {
    const result = await UsersService.getById(ctx.session.user.id);
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
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.updateProfile(
        ctx.session.user.id,
        input,
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
