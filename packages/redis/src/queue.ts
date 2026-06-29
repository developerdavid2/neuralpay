import type { NotificationJob } from "@neuralpay/types";
import { Queue } from "bullmq";

let notificationQueue: Queue | null = null;

function getConnection() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    maxRetriesPerRequest: null,
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

  return notificationQueue;
}

export async function emitNotification(job: NotificationJob) {
  const queue = getNotificationQueue();
  await queue.add("send", job, {
    priority: job.priority ?? 5,
    delay: job.delayMs ?? 0,
  });
}
