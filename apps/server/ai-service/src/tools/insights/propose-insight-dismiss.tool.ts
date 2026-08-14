import { randomUUID } from "node:crypto";
import { db } from "@neuralpay/db";
import { insights } from "@neuralpay/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export function buildProposeInsightDismissTool(userId: string) {
  return tool({
    description:
      "Draft a proposal to dismiss an insight the user has already seen and doesn't find useful. Never dismisses directly.",
    inputSchema: z.object({
      insightId: z.string(),
      reasoning: z.string(),
    }),
    execute: async ({ insightId, reasoning }) => {
      const [insight] = await db
        .select({ id: insights.id, title: insights.title })
        .from(insights)
        .where(and(eq(insights.id, insightId), eq(insights.userId, userId)))
        .limit(1);

      if (!insight) return { error: "Insight not found" };

      return {
        proposalId: randomUUID(),
        kind: "insight_dismiss" as const,
        insightId: insight.id,
        insightTitle: insight.title,
        reasoning,
      };
    },
  });
}
