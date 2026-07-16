import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const sendOtpSchema = z.object({
  email: z.email(),
  type: z.enum(["sign-in", "email-verification", "forget-password"]),
});

export const socialSignInSchema = z.object({
  provider: z.string(),
  idToken: z.object({
    token: z.string(),
    accessToken: z.string().optional(),
  }),
});

export const socialSignInUrlSchema = z.object({
  provider: z.string(),
  callbackURL: z.string().url(),
});

export type SignInInput = z.input<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type VerifyOtpInput = z.input<typeof verifyOtpSchema>;
export type SendOtpInput = z.input<typeof sendOtpSchema>;
export type SocialSignInInput = z.input<typeof socialSignInSchema>;

export type SignUpResult = {
  cookies: string[];
};

export type SignInResult = {
  user: Record<string, unknown>;
  session: Record<string, unknown>;
  cookies: string[];
};

export type SignOutResult = {
  cookies: string[];
};

export type VerifyOTPResult = {
  user: Record<string, unknown>;
  session: Record<string, unknown>;
  cookies: string[];
};
