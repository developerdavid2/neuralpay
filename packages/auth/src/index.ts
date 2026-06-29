import { createDb } from "@neuralpay/db";
import * as schema from "@neuralpay/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./lib/email";
import { otpTemplate, resetPasswordTemplate } from "./lib/email-templates";

export interface AuthConfig {
  corsOrigin: string;
  secret: string;
  baseURL: string;
  polar?: {
    accessToken: string;
    successUrl: string;
  };
  google?: {
    clientId: string;
    clientSecret: string;
  };
}

export function createAuth(config: AuthConfig) {
  const db = createDb();
  const isDev = process.env.NODE_ENV !== "production";
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

    user: {
      additionalFields: {
        phone: {
          type: "string",
          required: false,
          defaultValue: null,
          input: true,
        },
        planTier: {
          type: "string",
          required: false,
          defaultValue: "free",
          input: false,
        },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60,
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

    socialProviders: config.google
      ? {
          google: {
            clientId: config.google.clientId,
            clientSecret: config.google.clientSecret,
          },
        }
      : undefined,

    advanced: {
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      },
    },
  });
}

// ── Default export for services that need it ──
// This is for server-side use only (user-service, gateway)
const configFromEnv: AuthConfig = {
  corsOrigin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET ?? "",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4001",
  polar: process.env.POLAR_ACCESS_TOKEN
    ? {
        accessToken: process.env.POLAR_ACCESS_TOKEN,
        successUrl: process.env.POLAR_SUCCESS_URL ?? "",
      }
    : undefined,
  google:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
};

export const auth = createAuth(configFromEnv);
export type Auth = ReturnType<typeof createAuth>;
