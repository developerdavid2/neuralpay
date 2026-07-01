import { getRedisClient } from "@neuralpay/redis/client";
import { gatewayEnv } from "@neuralpay/env/gateway";
import crypto from "crypto";

const redis = getRedisClient(gatewayEnv.REDIS_URL);
const CACHE_TTL_SECONDS = 60 * 5;

function cacheKey(cookie: string) {
  const hash = crypto.createHash("sha256").update(cookie).digest("hex");
  return `session:${hash}`;
}

export async function getCachedSession(cookie: string) {
  const raw = await redis.get(cacheKey(cookie));
  return raw ? JSON.parse(raw) : null;
}

export async function setCachedSession(cookie: string, session: unknown) {
  await redis.set(
    cacheKey(cookie),
    JSON.stringify(session),
    "EX",
    CACHE_TTL_SECONDS,
  );
}
