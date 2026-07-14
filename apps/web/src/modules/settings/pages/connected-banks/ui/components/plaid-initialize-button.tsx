"use client";

import { Button } from "@neuralpay/ui/components/button";
import { CheckCircle2, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useCreateLinkToken } from "../../hooks/mutations/use-create-link-token";
import { useExchangePublicToken } from "../../hooks/mutations/use-exchange-public-token";
import { useProviderModal } from "../../hooks/store/use-provider-modal";

export function PlaidInitializeButton() {
  const [token, setToken] = useState<string | null>(null);
  const [linkOpened, setLinkOpened] = useState(false);
  const [success, setSuccess] = useState(false);

  const { selectedProvider, resetState } = useProviderModal();
  const { mutate: createToken, isPending: isCreating } = useCreateLinkToken();
  const { mutate: exchangeToken, isPending: isExchanging } =
    useExchangePublicToken();

  useEffect(() => {
    if (selectedProvider === "plaid" && !token) {
      createToken(undefined, {
        onSuccess: (data) => {
          setToken(data.linkToken);
        },
        onError: () => {
          setLinkOpened(false);
          setToken(null);
          resetState();
        },
      });
    }
  }, [selectedProvider, createToken, token]);

  const onSuccess = useCallback(
    (publicToken: string) => {
      exchangeToken(
        { publicToken },
        {
          onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
              resetState();
              setToken(null);
              setLinkOpened(false);
              setSuccess(false);
            }, 2000);
          },
          onError: (err) => {
            console.error("[plaid-button] Exchange failed:", err);
            setLinkOpened(false);
            setToken(null);
          },
        },
      );
    },
    [exchangeToken, resetState],
  );

  const onExit = useCallback(() => {
    // User closed Plaid without completing
    setLinkOpened(false);
    resetState();
    setToken(null);
  }, [resetState]);

  const { open, ready } = usePlaidLink({
    token: token || "",
    onSuccess,
    onExit,
  });

  // Auto-open Plaid when token is ready
  useEffect(() => {
    if (ready && token && !linkOpened && selectedProvider === "plaid") {
      setLinkOpened(true);
      // Small delay to ensure proper rendering
      setTimeout(() => {
        open();
      }, 100);
    }
  }, [ready, token, linkOpened, selectedProvider, open]);

  // Don't show anything if no provider selected
  if (selectedProvider !== "plaid") {
    return null;
  }

  // Success state
  if (success) {
    return (
      <Button disabled className="gap-2 bg-emerald-500 hover:bg-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        Connected Successfully!
      </Button>
    );
  }

  // Loading state
  return (
    <Button disabled className="gap-2">
      <Loader className="h-4 w-4 " />
      {isCreating
        ? "Initializing..."
        : isExchanging
          ? "Connecting..."
          : "Opening Plaid..."}
    </Button>
  );
}
