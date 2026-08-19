import type { NotificationJob } from "@orra/types";
import { Queue } from "bullmq";

let notificationQueue: Queue | null = null;

function getConnection() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000, // Increased for Render cold starts
    commandTimeout: 8_000, // Increased tolerance for slow Redis
    keepAlive: 30_000, // Keep connections alive longer
    enableOfflineQueue: true, // Queue commands during reconnect
    lazyConnect: false, // Connect eagerly on startup
  };
}

function getNotificationQueue(): Queue {
  if (notificationQueue) return notificationQueue;

  notificationQueue = new Queue("notifications", {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  notificationQueue.on("error", (err) => {
    console.error("[queue] connection error:", err.message);
  });

  return notificationQueue;
}

export async function emitNotification(job: NotificationJob) {
  const queue = getNotificationQueue();
  await queue.add("send", job, {
    priority: job.priority ?? 5,
    delay: job.delayMs ?? 0,
  });
}
