"use client";

import { useDrawerInit } from "@/hooks/use-drawer-init";
import { useAccountDetail } from "../../hooks/queries/use-account-detail";
import { useAccountDrawer } from "../../hooks/store/use-account-drawer";

interface Props {
  focusId?: string;
  mode?: string;
}

export function AccountDrawerInit({ focusId, mode }: Props) {
  const isAddMode = mode === "add";
  const shouldFetch = !!focusId && !isAddMode;
  const { account, isLoading } = useAccountDetail(shouldFetch ? focusId : "");

  useDrawerInit(
    focusId,
    mode,
    account ?? undefined,
    shouldFetch && isLoading,
    useAccountDrawer.getState,
    (s) => s.accountId,
  );

  return null;
}
