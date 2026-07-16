import { publicProcedure, router } from "@neuralpay/config/trpc";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  sendOtpSchema,
  socialSignInSchema,
  socialSignInUrlSchema,
} from "@neuralpay/types";
import { TRPCError } from "@trpc/server";
import { AuthService } from "../services/auth.service";

export const authRouter = router({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await AuthService.signUp(input);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      result.data.cookies.forEach((c) =>
        ctx.resHeaders!.append("Set-Cookie", c),
      );
      return result.data;
    }),

  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await AuthService.signIn(input);
      if (!result.success) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: result.error });
      }
      result.data.cookies.forEach((c) =>
        ctx.resHeaders!.append("Set-Cookie", c),
      );
      return result.data;
    }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const result = await AuthService.signOut(ctx._headers);
    if (!result.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
    }
    result.data.cookies.forEach((c) => ctx.resHeaders!.append("Set-Cookie", c));
    return result.data;
  }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      const result = await AuthService.forgotPassword(input.email);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      return result.data;
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      const result = await AuthService.resetPassword(
        input.email,
        input.otp,
        input.password,
      );
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      return result.data;
    }),

  sendOtp: publicProcedure.input(sendOtpSchema).mutation(async ({ input }) => {
    const result = await AuthService.sendVerificationOTP(
      input.email,
      input.type,
    );
    if (!result.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
    }
    return result.data;
  }),

  verifyEmail: publicProcedure
    .input(verifyOtpSchema)
    .mutation(async ({ input }) => {
      const result = await AuthService.verifyEmailOTP(input.email, input.otp);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      return result.data;
    }),

  signInWithOTP: publicProcedure
    .input(verifyOtpSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await AuthService.signInWithOTP(input.email, input.otp);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      result.data.cookies.forEach((c) =>
        ctx.resHeaders!.append("Set-Cookie", c),
      );
      return result.data;
    }),
  signInWithSocial: publicProcedure
    .input(socialSignInSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await AuthService.signInWithSocial(
        input.provider,
        input.idToken,
      );
      if (!result.success) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: result.error });
      }
      result.data.cookies.forEach((c) =>
        ctx.resHeaders!.append("Set-Cookie", c),
      );
      return result.data;
    }),

  getSocialSignInUrl: publicProcedure
    .input(socialSignInUrlSchema)
    .query(async ({ input, ctx }) => {
      const result = await AuthService.getSocialSignInUrl(
        input.provider,
        input.callbackURL,
      );
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      if (result.cookies?.length) {
        result.cookies.forEach((cookie) =>
          ctx.resHeaders!.append("set-cookie", cookie),
        );
      }
      return result.data;
    }),
});
