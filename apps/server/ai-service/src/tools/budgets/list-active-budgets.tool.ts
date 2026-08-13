import { db } from "@neuralpay/db";
import { budgets } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export function buildListActiveBudgetsTool(userId: string) {
  return tool({
    description: "List the user's currently active (non-archived) budgets.",
    inputSchema: z.object({}),
    execute: async () => {
      const rows = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          limitAmount: budgets.limitAmount,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
        })
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
        .orderBy(desc(budgets.startDate))
        .limit(20);
      return rows;
    },
  });
}
