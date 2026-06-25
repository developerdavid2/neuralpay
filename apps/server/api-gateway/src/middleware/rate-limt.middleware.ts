import type { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redis } from "../lib/redis";
import { logger } from "../utils/logger";

// Global — all requests through the gateway
const globalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_global",
  points: 200, // requests
  duration: 60, // per 60 seconds
  blockDuration: 30, // block for 30s if exceeded
});

// Auth routes — stricter, prevents brute force
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_auth",
  points: 20,
  duration: 60,
  blockDuration: 120, // 2 min block on auth abuse
});

// Plaid routes — each call costs money, protect aggressively
const plaidLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_plaid",
  points: 30,
  duration: 60,
  blockDuration: 60,
});

// Use authenticated user id if available, fall back to IP
function resolveKey(req: Request): string {
  const user = (req as any).user;
  if (user?.id) return `user_${user.id}`;
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown";
  return `ip_${ip}`;
}

function rateLimitResponse(res: Response, retryAfter: number) {
  res.set("Retry-After", String(retryAfter));
  res.set("X-RateLimit-Reset", String(Date.now() + retryAfter * 1000));
  res.status(429).json({
    success: false,
    message: "Too many requests. Please slow down.",
    retryAfter,
  });
}

// ── Middleware factories ───────────────────────────────────────────────────

function createLimiterMiddleware(limiter: RateLimiterRedis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = resolveKey(req);
    try {
      await limiter.consume(key);
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        const retryAfter = Math.ceil(err.msBeforeNext / 1000);
        logger.warn(
          `[rate-limit] blocked key=${key} retryAfter=${retryAfter}s`,
        );
        rateLimitResponse(res, retryAfter);
      } else {
        // Redis down — fail open, don't block legitimate traffic
        logger.error(`[rate-limit] Redis error, failing open: ${err}`);
        next();
      }
    }
  };
}

export const globalRateLimit = createLimiterMiddleware(globalLimiter);
export const authRateLimit = createLimiterMiddleware(authLimiter);
export const plaidRateLimit = createLimiterMiddleware(plaidLimiter);
