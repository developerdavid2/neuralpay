"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle, FaApple } from "react-icons/fa";
import { signInSchema, type SignInInput } from "@neuralpay/types";

import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { Checkbox } from "@neuralpay/ui/components/checkbox";
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

const SignInView = () => {
  const [status, setStatus] = useState<FormStatus>(idle);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const pending = status.type === "loading";

  const onSignIn = async (data: SignInInput) => {
    setStatus({ type: "loading" });

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          setStatus({ type: "success" });
          toast.success("Logged in Successfully", { position: "top-center" });
          router.push("/dashboard");
        },
        onError: ({ error }) => {
          if (error.code === "EMAIL_NOT_VERIFIED") {
            sessionStorage.setItem("verify_email", data.email);
            router.push("/auth/verify-otp");
            return;
          }
          setStatus({ type: "error", message: error.message });
        },
        ...(data.rememberMe && {
          fetchOptions: {
            headers: { "x-remember-me": "true" },
          },
        }),
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
      {/* ── Left — striped background + floating form card ──────────── */}
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
        {/* Floating white inner card */}
        <div className="relative z-10 w-full max-w-sm md:max-w-xl bg-card rounded-2xl border border-border shadow-xs p-12">
          <form
            id="sign-in-form"
            onSubmit={form.handleSubmit(onSignIn)}
            noValidate
          >
            <FieldGroup className="gap-5">
              {/* Header */}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and password
                </p>
              </div>

              <div className="flex items-center justify-center w-full gap-x-2">
                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onSocialSignIn("google")}
                  className="h-11 gap-2 bg-background flex-1"
                >
                  <GoogleIconIcon />
                  Sign in with Google
                </Button>
                {/* Apple */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onSocialSignIn("apple")}
                  className="h-11 gap-2 bg-background flex-1"
                >
                  <FaApple className="size-5" />
                  Sign in with Apple
                </Button>
              </div>

              <FieldSeparator>or</FieldSeparator>

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-email">
                      Email
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="sign-in-email"
                      type="email"
                      placeholder="mail@example.com"
                      disabled={pending}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      className="bg-background h-10"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-password">
                      Password
                      <span className="text-destructive ml-0.5">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="sign-in-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={pending}
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                        className="pr-11 bg-background h-10"
                      />
                      <button
                        type="button"
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <Controller
                  name="rememberMe"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal" className="w-auto gap-2">
                      <Checkbox
                        id="sign-in-remember"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={pending}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <FieldLabel
                        htmlFor="sign-in-remember"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Keep me logged in
                      </FieldLabel>
                    </Field>
                  )}
                />
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline underline-offset-4 font-medium"
                >
                  Forget password?
                </Link>
              </div>

              {/* Server error */}
              {status.type === "error" && (
                <Alert variant="destructive" className="py-3">
                  <OctagonAlertIcon className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium text-foreground">
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
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Sign up link */}
              <p className="text-center text-sm text-muted-foreground">
                Not registered yet?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-foreground hover:underline underline-offset-4"
                >
                  Create an Account
                </Link>
              </p>
            </FieldGroup>
          </form>
        </div>
      </div>

      {/* ── Right — marketing copy, plain background ─────────────────── */}
      <div className="hidden md:flex flex-col items-start justify-center px-16 py-16 max-w-xl">
        <h2 className="text-5xl font-bold text-foreground leading-tight mb-4">
          Make the best move to join our community!
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Save hundreds of hours trying to create and develop a dashboard from
          scratch.
        </p>
      </div>
    </div>
  );
};

export default SignInView;
