import Redis from "ioredis";
import { gatewayEnv } from "@neuralpay/env/gateway";
import { logger } from "../utils/logger";

export const redis = new Redis(gatewayEnv.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
});

redis.on("connect", () => logger.info("[redis] connected"));
redis.on("error", (err) => logger.error(`[redis] error: ${err.message}`));
