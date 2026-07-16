"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaApple } from "react-icons/fa";
import { Button } from "@neuralpay/ui/components/button";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { webEnv } from "@neuralpay/env/web";
import { useGetSocialSignInUrl } from "../../hooks/mutations/use-get-social-sign-in-url";

interface AppleSignInButtonProps {
  variant?: "signin" | "signup";
  className?: string;
}

export function AppleSignInButton({
  variant = "signin",
  className,
}: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const callbackURL = `${webEnv.NEXT_PUBLIC_APP_URL}/dashboard`;

  const { refetch } = useGetSocialSignInUrl("apple", callbackURL);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { data } = await refetch();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to get sign in URL", { position: "top-center" });
        setIsLoading(false);
      }
    } catch {
      toast.error("Failed to sign in with Apple", { position: "top-center" });
      setIsLoading(false);
    }
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
      {isLoading && <Spinner className="ml-2 size-4" />}
    </Button>
  );
}
