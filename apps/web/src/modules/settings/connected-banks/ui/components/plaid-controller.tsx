"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useCreateLinkToken } from "../../hooks/mutations/use-create-link-token";
import { useExchangePublicToken } from "../../hooks/mutations/use-exchange-public-token";
import { useProviderModal } from "../../hooks/store/use-provider-modal";

export function PlaidController() {
  const [token, setToken] = useState<string | null>(null);
  const [linkOpened, setLinkOpened] = useState(false);

  const { confirmedProvider, closeModal, resetState } = useProviderModal();
  const { mutate: createToken } = useCreateLinkToken();
  const { mutate: exchangeToken } = useExchangePublicToken();

  // Step 1: fetch link token as soon as provider is confirmed
  useEffect(() => {
    if (confirmedProvider === "plaid" && !token) {
      createToken(undefined, {
        onSuccess: (data) => setToken(data.linkToken),
        onError: () => resetState(), // reset everything if token fetch fails
      });
    }
    // Clean up local state when flow is reset
    if (!confirmedProvider) {
      setToken(null);
      setLinkOpened(false);
    }
  }, [confirmedProvider, createToken, resetState, token]);

  const onSuccess = useCallback(
    (publicToken: string) => {
      exchangeToken(
        { publicToken },
        {
          onSuccess: () => resetState(),
          onError: () => {
            setLinkOpened(false);
            setToken(null);
            resetState();
          },
        },
      );
    },
    [exchangeToken, resetState],
  );

  const onExit = useCallback(() => {
    setLinkOpened(false);
    setToken(null);
    resetState();
  }, [resetState]);

  const { open, ready } = usePlaidLink({
    token: token ?? "",
    onSuccess,
    onExit,
  });

  // Step 2: once token is ready, close the provider modal and open Plaid
  useEffect(() => {
    if (ready && token && !linkOpened && confirmedProvider === "plaid") {
      setLinkOpened(true);
      closeModal(); // dismiss provider modal first
      setTimeout(() => open(), 50); // then open Plaid
    }
  }, [ready, token, linkOpened, confirmedProvider, closeModal, open]);

  return null;
}
