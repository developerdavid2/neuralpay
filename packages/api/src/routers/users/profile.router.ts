import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import { updateUserSchema, UsersService } from "./users.service";

export const profileRouter = router({
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
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.update(ctx.session.user.id, input);
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
