import { Redis } from "ioredis";
import { getRedisClient } from "./client";

export async function publishToUser(
  userId: string,
  payload: unknown,
): Promise<void> {
  const redis = getRedisClient();
  await redis.publish(`user:${userId}:notifications`, JSON.stringify(payload));
}

export async function* subscribeToUser(
  userId: string,
  signal: AbortSignal,
): AsyncGenerator<unknown> {
  const channel = `user:${userId}:notifications`;

  const subscriber = new Redis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableReadyCheck: false,
      keepAlive: 10_000,
    },
  );

  const queue: unknown[] = [];
  let resolveNext: (() => void) | null = null;

  const onMessage = (ch: string, message: string) => {
    if (ch !== channel) return;
    queue.push(JSON.parse(message));
    resolveNext?.();
    resolveNext = null;
  };

  subscriber.on("message", onMessage);
  subscriber.on("error", (err) =>
    console.error(`[pubsub] subscriber error (user ${userId}):`, err.message),
  );

  await subscriber.subscribe(channel);

  const cleanup = async () => {
    subscriber.off("message", onMessage);
    try {
      await subscriber.unsubscribe(channel);
    } catch {}
    await subscriber.quit().catch(() => {});
  };
  signal.addEventListener("abort", cleanup, { once: true });

  try {
    while (!signal.aborted) {
      if (queue.length > 0) {
        yield queue.shift();
        continue;
      }
      await new Promise<void>((resolve) => {
        resolveNext = resolve;
      });
    }
  } finally {
    await cleanup();
  }
}
