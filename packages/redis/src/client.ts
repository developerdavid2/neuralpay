import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedisClient(url?: string): Redis {
  if (redis) return redis;

  const redisUrl: string =
    url || process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on("connect", () => console.log("[redis] connected"));
  redis.on("error", (err) => console.error(`[redis] error: ${err.message}`));
  redis.on("reconnecting", () => console.log("[redis] reconnecting..."));

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export { redisEnv } from "./env";
