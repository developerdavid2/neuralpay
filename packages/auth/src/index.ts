import { createDb } from "@neuralpay/db";
import * as schema from "@neuralpay/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./lib/email";
import { otpTemplate, resetPasswordTemplate } from "./lib/email-templates";

interface AuthConfig {
  corsOrigin: string;
  secret: string;
  baseURL: string;
  polar?: {
    accessToken: string;
    successUrl: string;
  };
}

export function createAuth(config: AuthConfig) {
  const db = createDb();

  return betterAuth({
    basePath: "/auth",
    database: drizzleAdapter(db, { provider: "pg", schema }),
    trustedOrigins: [config.corsOrigin],
    secret: config.secret,
    baseURL: config.baseURL,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      async sendResetPassword({ user, url }) {
        void sendEmail({
          to: user.email,
          subject: "Reset your password — NeuralPay",
          html: resetPasswordTemplate({ url }),
        });
      },
    },

    // ALTERNATIVE TO USING LINKS INSTEAD OF OTP
    // emailVerification: {
    //   sendOnSignUp: true,
    //   async sendVerificationEmail({ user, url }) {
    //     void sendEmail({
    //       to: user.email,
    //       subject: "Verify your email",
    //       html: `<p>Click the link to verify your email:</p><a href="${url}">${url}</a>`,
    //     });
    //   },
    // },
    session: {
      expiresIn: 60 * 60 * 24, // 1 day default
      updateAge: 60 * 60, // refresh if older than 1hr
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        sendVerificationOnSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          const subjects: Record<string, string> = {
            "sign-in": "Your sign-in code",
            "email-verification": "Verify your email",
            "forget-password": "Reset your password",
            "change-email": "Confirm your email change",
          };
          void sendEmail({
            to: email,
            subject: subjects[type] ?? "Your OTP code",
            html: otpTemplate({ otp, type }),
          });
        },
      }),
    ],

    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
  });
}
