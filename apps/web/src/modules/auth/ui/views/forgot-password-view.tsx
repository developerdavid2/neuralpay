"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@neuralpay/types";
import { ArrowLeft, Mail, OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertTitle } from "@neuralpay/ui/components/alert";
import { Button } from "@neuralpay/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@neuralpay/ui/components/field";
import { Input } from "@neuralpay/ui/components/input";
import type { Route } from "next";
import { toast } from "sonner";
import { useSendOtp } from "../../hooks/mutations/use-send-otp";

type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; email: string };

const ForgotPasswordView = () => {
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const router = useRouter();
  const sendOtp = useSendOtp();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const pending = status.type === "loading";

  const onSubmit = async (data: ForgotPasswordInput) => {
    setStatus({ type: "loading" });

    sendOtp.mutate(
      { email: data.email, type: "forget-password" },
      {
        onSuccess: () => {
          sessionStorage.setItem("reset_email", data.email);
          setStatus({ type: "success", email: data.email });
          toast.success("Recovery code sent to your email", {
            position: "top-center",
          });
          setTimeout(
            () => router.push("/auth/verify-otp?mode=reset" as Route),
            1500,
          );
        },
        onError: (error) => {
          const errorMsg =
            error.message || "Failed to send recovery code. Please try again.";
          setStatus({ type: "error", message: errorMsg });
          toast.error(errorMsg, { position: "top-center" });
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-16">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sign in
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-10">
          {status.type === "success" ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-foreground">
                  Check your inbox
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">
                    {status.email}
                  </span>
                  . Redirecting you now…
                </p>
              </div>
              <div className="h-1 w-24 rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full animate-[progress_1.5s_ease-in-out_forwards]" />
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="gap-6">
                {/* Header */}
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-foreground">
                    Forgot password?
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No worries. Enter your email and we'll send you a one-time
                    code to reset your password.
                  </p>
                </div>

                {/* Email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="forgot-email">
                        Email address
                        <span className="text-destructive ml-0.5">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="forgot-email"
                        type="email"
                        placeholder="mail@example.com"
                        disabled={pending}
                        aria-invalid={fieldState.invalid}
                        autoComplete="email"
                        autoFocus
                        className="bg-background h-11"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Error with retry */}
                {status.type === "error" && (
                  <div className="space-y-3">
                    <Alert variant="destructive" className="py-3">
                      <OctagonAlertIcon className="h-4 w-4" />
                      <AlertTitle className="text-sm font-medium">
                        {status.message}
                      </AlertTitle>
                    </Alert>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() => setStatus({ type: "idle" })}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={
                    pending ||
                    status.type === "error" ||
                    !form.formState.isValid
                  }
                  className="w-full h-11 font-semibold text-sm"
                >
                  {pending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground " />
                      Sending code…
                    </span>
                  ) : (
                    "Send reset code"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Remember it?{" "}
                  <Link
                    href="/auth/signin"
                    className="font-semibold text-foreground hover:underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </p>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordView;
