"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaApple } from "react-icons/fa";
import { signUpSchema, type SignUpInput } from "@neuralpay/types";

import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { Alert, AlertTitle } from "@neuralpay/ui/components/alert";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@neuralpay/ui/components/field";
import { cn } from "@neuralpay/ui/lib/utils";
import GoogleIconIcon from "@/public/assets/icons/google";
import { toast } from "sonner";

type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success" };

const idle: FormStatus = { type: "idle" };

const SignUpView = () => {
  const [status, setStatus] = useState<FormStatus>(idle);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const pending = status.type === "loading";

  const onSignUp = async (data: SignUpInput) => {
    setStatus({ type: "loading" });
    const { confirmPassword: _, ...payload } = data;

    await authClient.signUp.email(
      {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        callbackURL: "/auth/verify-email",
      },
      {
        onSuccess: () => {
          setStatus({ type: "success" });
          toast.success("Logged in Successfully", { position: "top-center" });
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(payload.email)}`,
          );
        },
        onError: ({ error }) => {
          setStatus({ type: "error", message: error.message });
        },
      },
    );
  };

  const onSocialSignIn = async (provider: "google" | "apple") => {
    setStatus({ type: "loading" });
    await authClient.signIn.social(
      { provider, callbackURL: "/dashboard" },
      {
        onSuccess: () => {
          setStatus({ type: "success" });
        },
        onError: ({ error }) => {
          setStatus({ type: "error", message: error.message });
        },
      },
    );
  };

  return (
    <div className="grid md:grid-cols-2 w-full min-h-full rounded-3xl overflow-hidden">
      {/* ── Left — identical stripe + card layout as sign-in ────────── */}
      <div
        className="relative flex items-center justify-center p-12 rounded-tl-[1rem] rounded-br-[1rem] rounded-tr-[4rem] rounded-bl-[4rem]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            color-mix(in oklch, var(--ring) 5%, transparent) 10px,
            color-mix(in oklch, var(--ring) 5%, transparent) 50px
          )`,
        }}
      >
        <div className="relative z-10 w-full max-w-sm md:max-w-xl bg-card rounded-2xl border border-border shadow-xs p-12">
          <form
            id="sign-up-form"
            onSubmit={form.handleSubmit(onSignUp)}
            noValidate
          >
            <FieldGroup className="gap-5">
              {/* Header — different from sign-in */}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Start free. No card required.
                </p>
              </div>

              {/* Social buttons — identical to sign-in */}
              <div className="flex items-center justify-center w-full gap-x-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onSocialSignIn("google")}
                  className="h-11 gap-2 bg-background flex-1"
                >
                  <GoogleIconIcon />
                  Sign up with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onSocialSignIn("apple")}
                  className="h-11 gap-2 bg-background flex-1"
                >
                  <FaApple className="size-5" />
                  Sign up with Apple
                </Button>
              </div>

              <FieldSeparator>or</FieldSeparator>

              {/* Name — extra field */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-name">
                      Full name
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="sign-up-name"
                      type="text"
                      placeholder="Alex Johnson"
                      disabled={pending}
                      aria-invalid={fieldState.invalid}
                      autoComplete="name"
                      className="bg-background"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Email — identical to sign-in */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-email">
                      Email
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="sign-up-email"
                      type="email"
                      placeholder="mail@example.com"
                      disabled={pending}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      className="bg-background"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Password — identical structure to sign-in */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-password">
                      Password
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="sign-up-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        disabled={pending}
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                        className="pr-11 bg-background"
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

              {/* Confirm password — extra field */}
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-confirm">
                      Confirm password
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="sign-up-confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password"
                        disabled={pending}
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                        className="pr-11 bg-background"
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

              {/* Server error — identical to sign-in */}
              {status.type === "error" && (
                <Alert variant="destructive" className="py-3">
                  <OctagonAlertIcon className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    {status.message}
                  </AlertTitle>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={pending}
                className="w-full h-12 font-semibold text-sm uppercase tracking-wide"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>

              {/* Bottom link — different from sign-in */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-semibold text-foreground hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </FieldGroup>
          </form>
        </div>
      </div>

      {/* ── Right — different copy from sign-in ──────────────────────── */}
      <div className="hidden md:flex flex-col items-start justify-center px-16 py-16 max-w-xl">
        <h2 className="text-5xl font-bold text-foreground leading-tight mb-4">
          Join thousands managing money smarter.
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          AI-powered insights, real-time anomaly detection, and social bill
          splitting — all in one place.
        </p>
      </div>
    </div>
  );
};

export default SignUpView;
