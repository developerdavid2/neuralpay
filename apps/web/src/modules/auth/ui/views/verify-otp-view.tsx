"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import {
  OctagonAlertIcon,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@neuralpay/ui/components/button";
import { Alert, AlertTitle } from "@neuralpay/ui/components/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@neuralpay/ui/components/input-otp";
import { Field, FieldGroup } from "@neuralpay/ui/components/field";
import { cn } from "@neuralpay/ui/lib/utils";

type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message?: string };

const RESEND_COOLDOWN = 60;

interface VerifyOtpViewProps {
  mode?: string;
}

const VerifyOtpView = ({ mode }: VerifyOtpViewProps) => {
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const isResetMode = mode === "reset";
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pending = status.type === "loading";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);
  useEffect(() => {
    const storageKey = isResetMode ? "reset_email" : "verify_email";
    const stored = sessionStorage.getItem(storageKey);

    if (!stored) {
      router.replace(isResetMode ? "/auth/forgot-password" : "/auth/signin");
      return;
    }

    setEmail(stored);
    setReady(true);
  }, [isResetMode, router]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [cooldown]);

  // Auto-submit on 6 digits
  useEffect(() => {
    if (otp.length === 6 && status.type === "idle" && ready) {
      void handleVerify(otp);
    }
  }, [otp, ready]);

  const handleVerify = async (code: string) => {
    if (!email || code.length !== 6 || pending) return;
    setStatus({ type: "loading" });

    try {
      if (isResetMode) {
        await authClient.emailOtp.checkVerificationOtp?.(
          { email, otp: code, type: "forget-password" },
          {
            onSuccess: () => {
              sessionStorage.setItem("reset_otp", code);
              sessionStorage.setItem("reset_email_verified", email);
              setStatus({
                type: "success",
                message: "OTP verified! Redirecting...",
              });
              if (redirectTimeoutRef.current)
                clearTimeout(redirectTimeoutRef.current);
              redirectTimeoutRef.current = setTimeout(() => {
                router.push("/auth/reset-password");
              }, 1500);
            },
            onError: ({ error }) => {
              setStatus({ type: "error", message: error.message });
              setOtp("");
            },
          },
        );
      } else {
        await authClient.emailOtp.verifyEmail(
          { email, otp: code },
          {
            onSuccess: () => {
              sessionStorage.removeItem("verify_email");
              setStatus({
                type: "success",
                message: "Email verified! Redirecting...",
              });
              if (redirectTimeoutRef.current)
                clearTimeout(redirectTimeoutRef.current);
              redirectTimeoutRef.current = setTimeout(() => {
                router.push("/onboarding");
              }, 1500);
            },
            onError: ({ error }) => {
              setStatus({ type: "error", message: error.message });
              setOtp("");
            },
          },
        );
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again.",
      });
      setOtp("");
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    setStatus({ type: "idle" });
    setOtp("");

    await authClient.emailOtp.sendVerificationOtp(
      {
        email,
        type: isResetMode ? "forget-password" : "email-verification",
      },
      {
        onError: ({ error }) => {
          setStatus({ type: "error", message: error.message });
        },
      },
    );
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  if (!ready) return null;

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href={isResetMode ? "/auth/forgot-password" : "/auth/signin"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          {isResetMode ? "Back to forgot password" : "Back to sign in"}
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-10">
          <FieldGroup className="gap-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-foreground">
                {isResetMode ? "Check your email" : "Verify your email"}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {maskedEmail}
                </span>
                . Enter it below to{" "}
                {isResetMode ? "reset your password" : "activate your account"}.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Field className="w-fit items-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (status.type === "error") setStatus({ type: "idle" });
                  }}
                  disabled={pending || status.type === "success"}
                  autoFocus
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className={cn(
                          "h-12 w-11 text-base font-semibold",
                          status.type === "error" &&
                            "border-destructive text-destructive",
                          status.type === "success" &&
                            "border-green-500 text-green-600",
                        )}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </Field>

              {pending && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                  Verifying…
                </p>
              )}
            </div>

            {/* ✅ Success Alert (same style as error) */}
            {status.type === "success" && (
              <Alert
                variant="default"
                className="py-3 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"
              >
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  {status.message ||
                    (isResetMode
                      ? "OTP verified! Redirecting..."
                      : "Email verified! Redirecting...")}
                </AlertTitle>
              </Alert>
            )}

            {/* Error Alert */}
            {status.type === "error" && (
              <Alert variant="destructive" className="py-3">
                <OctagonAlertIcon className="h-4 w-4" />
                <AlertTitle className="text-sm font-medium">
                  {status.message}
                </AlertTitle>
              </Alert>
            )}

            <Button
              type="button"
              disabled={
                otp.length !== 6 || pending || status.type === "success"
              }
              onClick={() => handleVerify(otp)}
              className="w-full h-11 font-semibold text-sm"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Verify code"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              {cooldown > 0 ? (
                <span className="font-medium">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-foreground hover:underline underline-offset-4 inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend
                </button>
              )}
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpView;
