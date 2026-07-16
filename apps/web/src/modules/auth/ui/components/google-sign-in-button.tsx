"use client";

import GoogleIconIcon from "../../../../../public/assets/icons/google";
import { Button } from "@neuralpay/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@neuralpay/ui/components/spinner";
import { useGetSocialSignInUrl } from "../../hooks/mutations/use-get-social-sign-in-url";
import { webEnv } from "@neuralpay/env/web";

interface GoogleSignInButtonProps {
  variant?: "signin" | "signup";
  className?: string;
}

export function GoogleSignInButton({
  variant = "signin",
  className,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const callbackURL = `${webEnv.NEXT_PUBLIC_APP_URL}/dashboard`;

  const { refetch } = useGetSocialSignInUrl("google", callbackURL);

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
      toast.error("Failed to sign in with Google", { position: "top-center" });
      setIsLoading(false);
    }
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
      {isLoading && <Spinner className="ml-2 size-4" />}
    </Button>
  );
}
