// cache.ts
import { getRedisClient } from "./client";

export interface CacheOptions {
  ttlSeconds: number;
  keyPrefix?: string;
}

export class Cache {
  private defaultPrefix: string;

  constructor(prefix = "orra") {
    this.defaultPrefix = prefix;
  }

  private get redis() {
    return getRedisClient();
  }

  private buildKey(key: string, prefix?: string): string {
    return `${prefix || this.defaultPrefix}:${key}`;
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const hit = await this.redis.get(fullKey);
      if (!hit) return null;
      try {
        return JSON.parse(hit) as T;
      } catch {
        return hit as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number,
    prefix?: string,
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      await this.redis.setex(fullKey, ttlSeconds, serialized);
    } catch {}
  }

  async del(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key, prefix);
      await this.redis.del(fullKey);
    } catch {}
  }

  async delPattern(pattern: string, prefix?: string): Promise<void> {
    try {
      const fullPattern = this.buildKey(pattern, prefix);
      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch {}
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number,
    prefix?: string,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key, prefix);
      if (cached !== null) return cached;

      const data = await fn();
      await this.set(key, data, ttlSeconds, prefix);
      return data;
    } catch {
      return fn();
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`*:${userId}:*`);
    await this.delPattern(`*:${userId}`);
  }
}

export const cache = new Cache();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  prefix?: string,
): Promise<T> {
  return cache.getOrSet(key, fn, ttlSeconds, prefix);
}
