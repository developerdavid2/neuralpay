"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@neuralpay/ui/components/button";
import { Loader } from "lucide-react";
import { useState } from "react";
import { FaApple } from "react-icons/fa";
import { toast } from "sonner";

interface AppleSignInButtonProps {
  variant?: "signin" | "signup";
  className?: string;
}

export function AppleSignInButton({
  variant = "signin",
  className,
}: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await authClient.signIn.social(
      {
        provider: "apple",
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
      {
        onSuccess: () => {
          toast.success("Logged in successfully", { position: "top-center" });
        },
        onError: ({ error }) => {
          const msg = error.message || "Failed to sign in with Apple";
          toast.error(msg, { position: "top-center" });
          setIsLoading(false);
        },
      },
    );
  };

  const label =
    variant === "signup" ? "Sign up with Apple" : "Sign in with Apple";

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      onClick={handleClick}
      className={className}
    >
      <FaApple className="size-5" />

      {isLoading ? "Signing in..." : label}

      {isLoading && <Loader className="ml-2 size-4 animate-spin" />}
    </Button>
  );
}
