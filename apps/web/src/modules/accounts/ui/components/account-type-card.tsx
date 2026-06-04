import { useEffect, useState } from "react";
import { cn } from "@neuralpay/ui/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants";
import { formatAmount } from "@/lib/utils";
import { AccountTypeBadge } from "./account-badges";
import type { AccountType } from "@neuralpay/types";

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;

function useMaskedNumber(seed: string, intervalMs: number) {
  const rand = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++)
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const generate = () => {
    const base = rand(seed + Date.now().toString().slice(-5));
    const last4 = String((base % 9000) + 1000);
    return `•••• •••• •••• ${last4}`;
  };
  const [masked, setMasked] = useState(() => generate());
  useEffect(() => {
    const t = setInterval(() => setMasked(generate()), intervalMs);
    return () => clearInterval(t);
  }, [seed, intervalMs]);
  return masked;
}

const ROTATE_MS: Record<string, number> = {
  checking: 17000,
  savings: 23000,
  credit: 31000,
  investment: 19000,
  crypto: 27000,
};

function NfcIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/30"
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
  type: AccountType;
  totalBalance: number;
  accountCount: number;
  isBalanceVisible: boolean;
}) {
  const config = ACCOUNT_TYPE_CONFIG[type];
  const masked = useMaskedNumber(type, ROTATE_MS[type] ?? 21000);
  if (!config) return null;

  const isEmpty = accountCount === 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-px",
        "h-[250px] w-full cursor-pointer select-none",
        // ── Unified aurora base — same for every card ──
        "bg-[radial-gradient(ellipse_at_30%_0%,rgba(80,40,160,0.9)_0%,rgba(20,10,45,1)_55%,rgba(6,4,14,1)_100%)]",
        "ring-1 ring-white/[0.07]",
        "shadow-[0_2px_20px_rgba(0,0,0,0.55)]",
        "hover:shadow-[0_6px_32px_rgba(0,0,0,0.65)]",
        "transition-shadow duration-500 ease-out",
        isEmpty && "opacity-40 saturate-50",
      )}
    >
      {/* Inner surface — same gradient, rounded inset */}
      <div className="relative h-full w-full overflow-hidden rounded-[15px] bg-[radial-gradient(ellipse_at_30%_0%,rgba(80,40,160,0.9)_0%,rgba(20,10,45,1)_55%,rgba(6,4,14,1)_100%)]">
        {/* Aurora bloom — soft violet light at top-left */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_55%_at_25%_0%,rgba(140,80,255,0.22),transparent_65%)]" />

        {/* Top bevel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Inner radial light */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),transparent_55%)]" />

        {/* TOP MOVING LIGHT — sweeps right→left on hover */}
        <span className="pointer-events-none absolute top-0 z-20 h-px w-[55%] opacity-0 transition-all duration-500 left-[45%] group-hover:left-4 group-hover:opacity-60 bg-gradient-to-r from-transparent via-white/55 to-transparent" />

        {/* BOTTOM MOVING LIGHT — sweeps left→right on hover */}
        <span className="pointer-events-none absolute bottom-0 z-20 h-px w-[35%] opacity-0 transition-all duration-500 left-4 group-hover:left-[60%] group-hover:opacity-50 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Noise grain */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-screen pointer-events-none"
          style={{ backgroundImage: NOISE, backgroundSize: "200px 200px" }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          <AccountTypeBadge type={type} variant="icon" />

          {/* MIDDLE: Balance */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
              {isEmpty ? "No accounts" : "Available balance"}
            </p>
            {!isEmpty && (
              <p
                className={cn(
                  "text-2xl font-bold text-white tabular-nums tracking-tight transition-all duration-300",
                  !isBalanceVisible && "blur-md select-none",
                )}
              >
                {isBalanceVisible
                  ? formatAmount(Math.abs(totalBalance))
                  : "$ ••••••"}
              </p>
            )}
          </div>

          {/* BOTTOM: Masked account number + shine line above it */}
          <div className="space-y-2">
            {/* Shine line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="flex items-end justify-between">
              <p
                className={cn(
                  "text-[11px] font-mono text-white/35 tracking-[0.18em] transition-all duration-700",
                  !isBalanceVisible && "blur-sm",
                )}
              >
                {masked}
              </p>
              <p className="text-[10px] font-mono text-white/25">
                {isEmpty
                  ? "——"
                  : `${accountCount} ${accountCount === 1 ? "acct" : "accts"}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
