import { db } from "@neuralpay/db";
import { bankAccounts } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export function buildGetAccountBalancesTool(userId: string) {
  return tool({
    description:
      "Get the user's bank account balances, types, names, and institution names. Use whenever the user asks about balances or accounts not already covered by the current context.",
    inputSchema: z.object({}),
    execute: async () => {
      const accounts = await db
        .select({
          name: bankAccounts.name,
          bankName: bankAccounts.bankName,
          type: bankAccounts.type,
          balance: bankAccounts.balance,
          isManual: bankAccounts.isManual,
        })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.status, "active"),
          ),
        );
      return accounts;
    },
  });
}
