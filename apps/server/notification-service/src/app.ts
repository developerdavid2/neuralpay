import { createExpressApp } from "@neuralpay/config/express-config";
import { notificationsServiceEnv } from "@neuralpay/env/notifications";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { notificationsRouter } from "./routers";
import { startNotificationWorker } from "./services/bullmq.service";
import { createContext } from "./trpc/context";

const PORT = Number(notificationsServiceEnv.PORT) || 4004;
const app = createExpressApp({
  serviceName: "notification-service",
  port: PORT,
});

// Ensure SSE subscription responses are never buffered by Render's edge proxy
app.use("/trpc/appNotifications.onNew", (_req, res, next) => {
  res.setHeader("x-accel-buffering", "no");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  next();
});

app.use(
  "/trpc",
  createExpressMiddleware({ router: notificationsRouter, createContext }),
);

app.listen(PORT, () => {
  console.log(`🔔 notification-service on http://localhost:${PORT}`);
  startNotificationWorker();
});
