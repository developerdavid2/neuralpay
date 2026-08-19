import { db, splits } from "@orra/db";
import { and, eq } from "drizzle-orm";

export async function fetchSplitContext(
  userId: string,
  splitId: string,
): Promise<unknown> {
  // splits uses creatorId, not userId
  const [split] = await db
    .select()
    .from(splits)
    .where(and(eq(splits.id, splitId), eq(splits.creatorId, userId)))
    .limit(1);

  if (!split) return { error: "Split not found" };

  return { split };
}
