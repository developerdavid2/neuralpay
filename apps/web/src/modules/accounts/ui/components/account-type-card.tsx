"use client";

import { cn } from "@neuralpay/ui/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants";
import { formatAmount } from "@/lib/utils";
import { Eye, EyeOff, Landmark } from "lucide-react";
import React, { useState, type ActionDispatch } from "react";
import { ACCOUNT_TYPES } from "@neuralpay/types";
import { useAccountAggregates } from "@/hooks/accounts/use-account-aggregates";
import { Button } from "@neuralpay/ui/components/button";

// ── NFC / Contactless SVG──────────
function NfcIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/40"
    >
      <path
        d="M12 2C10 6 10 18 12 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 4.5C15 8 15 16 16 19.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M20 7C20 10.5 20 13.5 20 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function AccountTypeCard({
  type,
  totalBalance,
  accountCount,
  isBalanceVisible,
}: {
  type: string;
  totalBalance: number;
  accountCount: number;
  isBalanceVisible: boolean;
}) {
  const config = ACCOUNT_TYPE_CONFIG[type];
  if (!config) return null;

  const isEmpty = accountCount === 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "h-[200px] w-full",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.03] hover:-translate-y-1",
        "hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]",
        "cursor-pointer select-none",
        config.gradient,
        isEmpty && "opacity-40 saturate-50",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_10%,rgba(255,255,255,0.18),transparent_70%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_90%_90%,rgba(0,0,0,0.25),transparent_70%)]" />

      {/* Horizontal sheen line */}
      <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full p-5">
        <div className="flex items-start justify-between">
          Logo
          <NfcIcon />
        </div>

        {/* MIDDLE: Available balance label + amount */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
            {isEmpty ? "No accounts" : "Available balance"}
          </p>
          {!isEmpty && (
            <p
              className={cn(
                "text-2xl font-bold text-white tabular-nums tracking-tight",
                !isBalanceVisible && "blur-md",
              )}
            >
              {isBalanceVisible
                ? formatAmount(Math.abs(totalBalance))
                : "$ ••••••"}
            </p>
          )}
        </div>

        {/* BOTTOM ROW: account type label left, masked count right */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.15em]">
              {config.label}
            </p>
            <p className="text-[11px] font-mono text-white/40">
              {isEmpty
                ? "——"
                : `${accountCount} ${accountCount === 1 ? "acct" : "accts"}`}
            </p>
          </div>

          {/* Type badge — subtle, bottom right */}
          <span className="text-[10px] font-mono tracking-widest text-white/25">
            {config.shortLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TotalCard({
  totalBalance,
  totalCount,
  isBalanceVisible,
  setIsBalanceVisible,
}: {
  totalBalance: number;
  totalCount: number;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (value: boolean) => void;
}) {
  return (
    <div className="bg-card p-4 rounded-xl">
      {/* MIDDLE */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-widest">
          Net worth
        </p>
        <p
          className={cn(
            "text-2xl font-bold text-white tabular-nums tracking-tight",
            !isBalanceVisible && "blur-md",
          )}
        >
          {isBalanceVisible ? formatAmount(totalBalance) : "$ ••••••"}
        </p>
      </div>

      <div className="flex items-center justify-end">
        <Button
          size="icon"
          onClick={() => setIsBalanceVisible((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isBalanceVisible ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
          <span>{isBalanceVisible ? "Hide balances" : "Show balances"}</span>
        </Button>
      </div>
    </div>
  );
}
