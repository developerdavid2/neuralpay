import { db } from "@neuralpay/db";
import { notificationPreferences } from "@neuralpay/db/schema";
import { eq } from "drizzle-orm";
import { getRedisClient } from "@neuralpay/redis";
import type { NotificationPreferences, ServiceResult } from "@neuralpay/types";

const DEFAULTS: NotificationPreferences = {
  transactionAlerts: true,
  accountAlerts: true,
  insightsAlerts: true,
  coachAlerts: true,
  budgetAlerts: true,
  splitNotifs: true,
  vaultUpdates: true,
  weeklyReport: true,
  emailEnabled: true,
  pushEnabled: true,
};

const PREFERENCE_KEYS: (keyof NotificationPreferences)[] = [
  "transactionAlerts",
  "accountAlerts",
  "insightsAlerts",
  "coachAlerts",
  "budgetAlerts",
  "splitNotifs",
  "vaultUpdates",
  "weeklyReport",
  "emailEnabled",
  "pushEnabled",
];

function normalizePreferences(
  raw: Record<string, unknown> | undefined,
): NotificationPreferences {
  if (!raw) return DEFAULTS;

  const result = { ...DEFAULTS };

  for (const key of PREFERENCE_KEYS) {
    const value = raw[key];
    if (typeof value === "boolean") {
      result[key] = value;
    }
    // If null/undefined, keep the default
  }

  return result;
}

export async function getUserPreferences(
  userId: string,
): Promise<ServiceResult<NotificationPreferences>> {
  try {
    const redis = getRedisClient();
    const key = `prefs:${userId}`;

    const cached = await redis.get(key);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    const result = normalizePreferences(prefs as Record<string, unknown>);
    await redis.setex(key, 300, JSON.stringify(result));

    return { success: true, data: result };
  } catch (err) {
    console.error("[getUserPreferences]", err);
    return {
      success: false,
      error: "Failed to load notification preferences",
      code: "DB_ERROR",
    };
  }
}

export async function updateUserPreferences(
  userId: string,
  input: Partial<NotificationPreferences>,
): Promise<ServiceResult<{ userId: string }>> {
  try {
    if (Object.keys(input).length === 0) {
      return { success: true, data: { userId } };
    }

    await db
      .insert(notificationPreferences)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: input,
      });

    await invalidatePreferencesCache(userId);

    return { success: true, data: { userId } };
  } catch (err) {
    console.error("[updateUserPreferences]", err);
    return {
      success: false,
      error: "Failed to update notification preferences",
      code: "DB_ERROR",
    };
  }
}

export async function invalidatePreferencesCache(userId: string) {
  const redis = getRedisClient();
  await redis.del(`prefs:${userId}`);
}
