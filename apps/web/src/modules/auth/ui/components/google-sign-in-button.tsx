"use client";

import { authClient } from "@/lib/auth-client";
import GoogleIconIcon from "@/public/assets/icons/google";
import { Button } from "@neuralpay/ui/components/button";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  variant?: "signin" | "signup";
  className?: string;
}

export function GoogleSignInButton({
  variant = "signin",
  className,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
        },

        onError: ({ error }) => {
          const msg = error.message || "Failed to sign in with Google";
          toast.error(msg, { position: "top-center" });
          setIsLoading(false);
        },
      },
    );
  };

  const label =
    variant === "signup" ? "Sign up with Google" : "Sign in with Google";

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      onClick={handleClick}
      className={className}
    >
      <GoogleIconIcon />

      {isLoading ? "Signing in..." : label}

      {isLoading && <Loader className="ml-2 size-4 animate-spin" />}
    </Button>
  );
}
