import { getRedisClient } from "@neuralpay/redis";
import { db } from "@neuralpay/db";
import { notificationPreferences } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";

const redis = getRedisClient();

export async function getUserPreferences(userId: string) {
  const cacheKey = `prefs:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  const defaults = {
    paymentAlerts: true,
    budgetAlerts: true,
    splitNotifs: true,
    vaultUpdates: true,
    weeklyReport: true,
    anomalyAlerts: true,
    emailEnabled: true,
    pushEnabled: true,
  };
  const result = prefs ?? defaults;
  await redis.setex(cacheKey, 300, JSON.stringify(result));
  return result;
}
