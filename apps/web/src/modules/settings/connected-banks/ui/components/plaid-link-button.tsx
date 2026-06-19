// components/plaid-link-button.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useCreateLinkToken } from "../../hooks/mutations/use-create-link-token";
import { useExchangePublicToken } from "../../hooks/mutations/use-exchange-public-token";
import { Button } from "@neuralpay/ui/components/button";

export function PlaidLinkButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const [token, setToken] = useState<string | null>(null);
  const { mutate: createToken, isPending: isCreating } = useCreateLinkToken();
  const { mutate: exchangeToken, isPending: isExchanging } =
    useExchangePublicToken();

  useEffect(() => {
    createToken(undefined, {
      onSuccess: (data) => setToken(data.linkToken),
    });
  }, [createToken]);

  const onSuccess = useCallback(
    (publicToken: string) => {
      exchangeToken({ publicToken });
    },
    [exchangeToken],
  );

  const { open, ready } = usePlaidLink({
    token: token || "",
    onSuccess,
  });

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || isCreating || isExchanging}
      variant={variant}
      className="gap-2"
    >
      {isCreating
        ? "Initializing..."
        : isExchanging
          ? "Connecting..."
          : "🔗 Connect Bank"}
    </Button>
  );
}
