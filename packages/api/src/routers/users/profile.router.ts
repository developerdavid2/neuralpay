import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { UsersService } from "./users.service";

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
  list: publicProcedure.query(async () => {
    const result = await UsersService.getAllUsers();
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
