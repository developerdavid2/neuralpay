// client.ts
import { Redis } from "ioredis";

let redis: InstanceType<typeof Redis> | null = null;

export function getRedisClient(url?: string): InstanceType<typeof Redis> {
  if (redis) return redis;

  const redisUrl: string =
    url || process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("connect", () => console.log("[redis] connected"));
  redis.on("error", (err) => console.error(`[redis] error: ${err.message}`));
  redis.on("reconnecting", () => console.log("[redis] reconnecting..."));

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
    } catch {
    } finally {
      redis = null;
    }
  }
}

export { redisEnv } from "./env";
