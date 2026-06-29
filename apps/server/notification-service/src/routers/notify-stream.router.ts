import type { Request, Response } from "express";
import { addSseClient } from "../channels/realtime";

export function notifyStreamHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  console.log(`[sse handler] userId from headers: ${userId}`);
  if (!userId) {
    console.log("[sse handler] no userId, returning 401");
    return res.status(401).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const remove = addSseClient(userId, res);
  const heartbeat = setInterval(() => res.write(":heartbeat\n\n"), 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    remove();
  });
}
