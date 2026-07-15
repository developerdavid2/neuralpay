import type {
  ServiceResult,
  SignInInput,
  SignInResult,
  SignOutResult,
  SignUpInput,
  SignUpResult,
  VerifyOTPResult,
} from "@neuralpay/types";
import { auth } from "../lib/auth";

function getCookies(response: Response): string[] {
  return response.headers.getSetCookie();
}

function parseAuthPayload(raw: unknown): {
  user: Record<string, unknown>;
  session: Record<string, unknown>;
} {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "user" in raw &&
    "session" in raw
  ) {
    return raw as {
      user: Record<string, unknown>;
      session: Record<string, unknown>;
    };
  }
  return { user: {}, session: {} };
}

export const AuthService = {
  async signUp(input: SignUpInput): Promise<ServiceResult<SignUpResult>> {
    try {
      const response = await auth.api.signUpEmail({
        body: input,
        asResponse: true,
      });
      if (!response.ok) {
        return { success: false, error: "Sign up failed", code: "BAD_REQUEST" };
      }
      return { success: true, data: { cookies: getCookies(response) } };
    } catch (err) {
      console.error("[AuthService.signUp]", err);
      return {
        success: false,
        error: "Failed to sign up",
        code: "BAD_REQUEST",
      };
    }
  },

  async signIn(input: SignInInput): Promise<ServiceResult<SignInResult>> {
    try {
      const response = await auth.api.signInEmail({
        body: input,
        asResponse: true,
      });
      if (!response.ok) {
        return {
          success: false,
          error: "Invalid email or password",
          code: "UNAUTHORIZED",
        };
      }
      const payload = parseAuthPayload(await response.json());
      return {
        success: true,
        data: {
          user: payload.user,
          session: payload.session,
          cookies: getCookies(response),
        },
      };
    } catch (err) {
      console.error("[AuthService.signIn]", err);
      return {
        success: false,
        error: "Invalid email or password",
        code: "UNAUTHORIZED",
      };
    }
  },

  async signOut(headers: Headers): Promise<ServiceResult<SignOutResult>> {
    try {
      const response = await auth.api.signOut({ headers, asResponse: true });
      return { success: true, data: { cookies: getCookies(response) } };
    } catch (err) {
      console.error("[AuthService.signOut]", err);
      return {
        success: false,
        error: "Failed to sign out",
        code: "BAD_REQUEST",
      };
    }
  },

  async forgotPassword(email: string): Promise<ServiceResult<void>> {
    try {
      await auth.api.sendVerificationOTP({
        body: { email, type: "forget-password" },
      });
    } catch (err) {
      console.error("[AuthService.forgotPassword]", err);
    }
    return { success: true, data: undefined };
  },

  async resetPassword(
    email: string,
    otp: string,
    password: string,
  ): Promise<ServiceResult<void>> {
    try {
      await auth.api.resetPasswordEmailOTP({
        body: { email, otp, password },
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[AuthService.resetPassword]", err);
      return {
        success: false,
        error: "Invalid or expired code",
        code: "BAD_REQUEST",
      };
    }
  },

  async sendVerificationOTP(
    email: string,
    type: "sign-in" | "email-verification" | "forget-password",
  ): Promise<ServiceResult<void>> {
    try {
      await auth.api.sendVerificationOTP({
        body: { email, type },
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[AuthService.sendVerificationOTP]", err);
      return {
        success: false,
        error: "Failed to send code",
        code: "BAD_REQUEST",
      };
    }
  },

  async verifyEmailOTP(
    email: string,
    otp: string,
  ): Promise<ServiceResult<void>> {
    try {
      await auth.api.verifyEmailOTP({
        body: { email, otp },
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[AuthService.verifyEmailOTP]", err);
      return {
        success: false,
        error: "Invalid or expired code",
        code: "BAD_REQUEST",
      };
    }
  },

  async signInWithOTP(
    email: string,
    otp: string,
  ): Promise<ServiceResult<VerifyOTPResult>> {
    try {
      const response = await auth.api.signInEmailOTP({
        body: { email, otp },
        asResponse: true,
      });
      if (!response.ok) {
        return {
          success: false,
          error: "Invalid or expired code",
          code: "BAD_REQUEST",
        };
      }
      const payload = parseAuthPayload(await response.json());
      return {
        success: true,
        data: {
          user: payload.user,
          session: payload.session,
          cookies: getCookies(response),
        },
      };
    } catch (err) {
      console.error("[AuthService.signInWithOTP]", err);
      return {
        success: false,
        error: "Invalid or expired code",
        code: "BAD_REQUEST",
      };
    }
  },
};
