import { db } from "@neuralpay/db";
import { notificationPreferences } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";
import { getRedisClient } from "@neuralpay/redis";

const DEFAULTS = {
  paymentAlerts: true,
  budgetAlerts: true,
  splitNotifs: true,
  vaultUpdates: true,
  weeklyReport: true,
  anomalyAlerts: true,
  emailEnabled: true,
  pushEnabled: true,
};

export async function getUserPreferences(userId: string) {
  const redis = getRedisClient();
  const key = `prefs:${userId}`;

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));

  const result = prefs ?? DEFAULTS;
  await redis.setex(key, 300, JSON.stringify(result));
  return result;
}

export async function invalidatePreferencesCache(userId: string) {
  const redis = getRedisClient();
  await redis.del(`prefs:${userId}`);
}
