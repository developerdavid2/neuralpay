"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeft,
  CheckCircle,
  OctagonAlertIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTitle } from "@neuralpay/ui/components/alert";
import { Button } from "@neuralpay/ui/components/button";
import { Field, FieldGroup } from "@neuralpay/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@neuralpay/ui/components/input-otp";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { cn } from "@neuralpay/ui/lib/utils";
import { toast } from "sonner";
import { Show } from "@/components/show";
import { useSendOtp } from "../../hooks/mutations/use-send-otp";
import { useVerifyEmail } from "../../hooks/mutations/use-verify-email";

type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message?: string };

const RESEND_COOLDOWN = 60;

function getStorageKey(isResetMode: boolean) {
  return isResetMode ? "reset_email" : "verify_email";
}

function readEmailFromStorage(isResetMode: boolean): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(getStorageKey(isResetMode));
}

interface VerifyOtpViewProps {
  mode?: string;
}

const VerifyOtpView = ({ mode }: VerifyOtpViewProps) => {
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isResetMode = mode === "reset";

  // Read email synchronously on mount — no effect needed
  const [email, setEmail] = useState(
    () => readEmailFromStorage(isResetMode) ?? "",
  );
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [cooldown, setCooldown] = useState(0);

  const verifyEmailOtp = useVerifyEmail();
  const sendOtp = useSendOtp();

  const pending = status.type === "loading";

  // Redirect if no email found — only on mount
  const [ready, setReady] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (!email) {
      hasRedirected.current = true;
      router.replace(isResetMode ? "/auth/forgot-password" : "/auth/signin");
      return;
    }
    setReady(true);
  }, [email, isResetMode, router]);

  // Cleanup redirect timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Countdown timer — single interval, no restart on cooldown change
  useEffect(() => {
    if (cooldown <= 0 || timerRef.current) return;

    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!email || code.length !== 6 || pending) return;
      setStatus({ type: "loading" });

      if (isResetMode) {
        sessionStorage.setItem("reset_otp", code);
        sessionStorage.setItem("reset_email_verified", email);
        setStatus({ type: "success", message: "OTP accepted! Redirecting..." });
        redirectTimeoutRef.current = setTimeout(
          () => router.push("/auth/reset-password"),
          1500,
        );
      } else {
        verifyEmailOtp.mutate(
          { email, otp: code },
          {
            onSuccess: () => {
              sessionStorage.removeItem("verify_email");
              setStatus({
                type: "success",
                message: "Email verified! Redirecting...",
              });
              toast.success("Email verified successfully", {
                position: "top-center",
              });
              redirectTimeoutRef.current = setTimeout(
                () => router.push("/onboarding"),
                1500,
              );
            },
            onError: (error) => {
              const errorMsg =
                error.message || "Invalid OTP. Please try again.";
              setStatus({ type: "error", message: errorMsg });
              toast.error(errorMsg, { position: "top-center" });
              setOtp("");
            },
          },
        );
      }
    },
    [email, isResetMode, pending, router, verifyEmailOtp],
  );

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtp(value);
      if (status.type === "error") setStatus({ type: "idle" });

      // Auto-submit when 6 digits entered
      if (value.length === 6 && status.type !== "loading" && ready) {
        void handleVerify(value);
      }
    },
    [handleVerify, ready, status.type],
  );

  const handleResend = useCallback(() => {
    if (!email || cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    setStatus({ type: "idle" });
    setOtp("");

    sendOtp.mutate(
      {
        email,
        type: isResetMode ? "forget-password" : "email-verification",
      },
      {
        onSuccess: () =>
          toast.success("Code sent! Check your email", {
            position: "top-center",
          }),
        onError: (error) => {
          const errorMsg =
            error.message || "Failed to resend code. Please try again.";
          setStatus({ type: "error", message: errorMsg });
          toast.error(errorMsg, { position: "top-center" });
          setCooldown(0);
        },
      },
    );
  }, [cooldown, email, isResetMode, sendOtp]);

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
                  onChange={handleOtpChange}
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
                  <Spinner className="size-3" />
                  Verifying...
                </p>
              )}
            </div>

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
              <Show when={pending} fallback={"Verify code"}>
                <span className="flex items-center gap-2">
                  <Spinner className="size-4 text-primary-foreground" />
                  Verifying...
                </span>
              </Show>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive a code?{" "}
              <Show
                when={cooldown > 0}
                fallback={
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-semibold text-foreground hover:underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend
                  </button>
                }
              >
                <span className="font-medium">Resend in {cooldown}s</span>
              </Show>
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpView;
