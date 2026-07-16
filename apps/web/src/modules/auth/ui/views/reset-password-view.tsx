"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@neuralpay/types";
import { CheckCircle2, Eye, EyeOff, OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { cn } from "@neuralpay/ui/lib/utils";
import { toast } from "sonner";
import { useResetPassword } from "../../hooks/mutations/use-reset-password";

type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success" };

const ResetPasswordView = () => {
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "", otp: "", password: "" },
  });
  useEffect(() => {
    // Must have come from verify-otp page
    const storedEmail = sessionStorage.getItem("reset_email_verified");
    const storedOtp = sessionStorage.getItem("reset_otp");

    if (!storedEmail || !storedOtp) {
      router.replace("/auth/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setOtp(storedOtp);
    form.reset({
      email: storedEmail,
      otp: storedOtp,
      password: "",
      confirmPassword: "",
    });
    setReady(true);
  }, [form, router]);

  const pending = status.type === "loading";

  const onSubmit = async (data: ResetPasswordInput) => {
    setStatus({ type: "loading" });

    resetPassword.mutate(data, {
      onSuccess: () => {
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_otp");
        sessionStorage.removeItem("reset_email_verified");
        setStatus({ type: "success" });
        toast.success("Password reset successfully!", {
          position: "top-center",
        });
        setTimeout(() => router.push("/auth/signin"), 2000);
      },
      onError: (error) => {
        const errorMsg =
          error.message || "Failed to reset password. Please try again.";
        setStatus({ type: "error", message: errorMsg });
        toast.error(errorMsg, { position: "top-center" });
      },
    });
  };

  if (!ready) return null;

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-10">
          {status.type === "success" ? (
            // ── Success state ──────────────────────────────────────────
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-foreground">
                  Password reset!
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your password has been updated. Redirecting you to sign in…
                </p>
              </div>
              <div className="h-1 w-24 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ animation: "progress 2s ease-in-out forwards" }}
                />
              </div>
            </div>
          ) : (
            // ── Form state ─────────────────────────────────────────────
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="gap-5">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-foreground">
                    Set new password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a strong password for your account.
                  </p>
                </div>

                {/* New password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="reset-password">
                        New password
                        <span className="text-destructive ml-0.5">*</span>
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          disabled={pending}
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                          autoFocus
                          className="pr-11 bg-background h-11"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md",
                            "text-muted-foreground hover:text-foreground",
                            "hover:bg-muted transition-colors duration-150",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Confirm password */}
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="reset-confirm">
                        Confirm password
                        <span className="text-destructive ml-0.5">*</span>
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="reset-confirm"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          disabled={pending}
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                          className="pr-11 bg-background h-11"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowConfirm((v) => !v)}
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md",
                            "text-muted-foreground hover:text-foreground",
                            "hover:bg-muted transition-colors duration-150",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

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
                      Resetting password…
                    </span>
                  ) : (
                    "Reset password"
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

export default ResetPasswordView;
