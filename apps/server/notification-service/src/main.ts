import { notificationsServiceEnv } from "@neuralpay/env/notifications";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { notificationsRouter } from "./routers";
import { notifyStreamHandler } from "./routers/notify-stream.router";
import { startNotificationWorker } from "./services/bullmq.service";
import { createContext } from "./trpc/context";

const PORT = Number(notificationsServiceEnv.PORT) || 4004;
const app = express();

// notification-service main.ts
app.use(
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3001",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "notification-service", port: PORT }),
);

// ── SSE endpoint ──
app.get("/stream", notifyStreamHandler);

app.use(
  "/trpc",
  createExpressMiddleware({ router: notificationsRouter, createContext }),
);

app.listen(PORT, () => {
  console.log(`🔔 notification-service on http://localhost:${PORT}`);
  startNotificationWorker();
});
