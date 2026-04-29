/**
 * notification-service — Express + Socket.io
 * Responsibilities: WebSocket server, push alert dispatch, RabbitMQ consumer fan-out
 * Port: 4004
 */
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createExpressApp } from "@neuralpay/config/express";

const PORT = Number(process.env.PORT) || 4004;
const app = createExpressApp({
  serviceName: "notification-service",
  port: PORT,
  allowedOrigins: ["http://localhost:3000"],
});
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: ["http://localhost:3000"], credentials: true },
  transports: ["websocket", "polling"],
});

// TODO: Add socket auth middleware to verify access token before connection is accepted.
// io.use(socketAuthMiddleware);
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  // TODO: Resolve user identity and join personal room for targeted notifications.
  // socket.join(`user:${socket.data.userId}`);
  socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
});

app.set("io", io);
// TODO: Mount notificationsRouter for in-app notification reads and acknowledgment updates.
// app.use("/notifications", notificationsRouter);
httpServer.listen(PORT, () => {
  console.log(`🚀 notification-service running on http://localhost:${PORT}`);
  console.log(`   Socket.io ready on ws://localhost:${PORT}`);
});

export { io };
