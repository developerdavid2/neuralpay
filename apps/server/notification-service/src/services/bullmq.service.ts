import { Worker } from "bullmq";
import { handleEvent } from "../handlers";
import type { NotificationJob } from "@neuralpay/types";
import { notificationsServiceEnv } from "@neuralpay/env/notifications";

const connection = {
  host: new URL(notificationsServiceEnv.REDIS_URL ?? "redis://localhost:6379")
    .hostname,
  port:
    Number(
      new URL(notificationsServiceEnv.REDIS_URL ?? "redis://localhost:6379")
        .port,
    ) || 6379,
  maxRetriesPerRequest: null,
};

export function startNotificationWorker() {
  const worker = new Worker(
    "notifications",
    async (job) => {
      const { event } = job.data as NotificationJob;
      await handleEvent(event);
    },
    { connection, concurrency: 20 },
  );

  worker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  return worker;
}
