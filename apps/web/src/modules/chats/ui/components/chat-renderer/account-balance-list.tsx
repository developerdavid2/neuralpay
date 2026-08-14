"use client";

import { Landmark } from "lucide-react";
import { formatAmount } from "@/lib/utils";

interface AccountItem {
  name: string;
  bankName?: string | null;
  type: string;
  balance: string | number;
  isManual?: boolean;
  currentMonthSpend?: number;
}

export function AccountBalanceList({ data }: { data: AccountItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        No accounts found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl w-full border border-border divide-y divide-border overflow-hidden">
      {data.map((a, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Landmark className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{a.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {a.bankName ?? "Manual"} · {a.type}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold">
              {formatAmount(Number(a.balance))}
            </p>
            {a.currentMonthSpend !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatAmount(a.currentMonthSpend)} spent
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
