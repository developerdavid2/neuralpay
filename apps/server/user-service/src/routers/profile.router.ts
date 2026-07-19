import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@neuralpay/config/trpc";
import { db } from "@neuralpay/db";
import { user } from "@neuralpay/db/schema";
import { deleteFileIfExists } from "@neuralpay/file-upload";
import { updateProfileSchema } from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UsersService } from "../services/users.service";

export const profileRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "user-service" })),

  me: publicProcedure.query(async ({ ctx }) => {
    const result = await UsersService.getById(
      "lMpHXrQwQhCSRHZ9cXQ3YCPFK5UTlM3K",
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

  update: protectedProcedure
    .input(updateProfileSchema)
    .use(async ({ ctx, input, next }) => {
      let existingKey: string | undefined | null;

      if (input.imageKey !== undefined) {
        const [row] = await db
          .select({ key: user.imageKey })
          .from(user)
          .where(eq(user.id, ctx.session.user.id));
        existingKey = row?.key;
      }

      const result = await next();

      if (
        result.ok &&
        existingKey &&
        input.imageKey !== undefined &&
        input.imageKey !== existingKey
      ) {
        await deleteFileIfExists(existingKey);
      }

      return result;
    })
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
