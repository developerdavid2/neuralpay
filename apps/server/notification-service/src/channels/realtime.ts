import type { Response } from "express";

const clients = new Map<string, Set<Response>>();

export function addSseClient(userId: string, res: Response) {
  console.log(
    `[sse] client connected for user ${userId}, total clients: ${clients.get(userId)?.size ?? 0}`,
  );
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
  return () => {
    console.log(`[sse] client disconnected for user ${userId}`);
    clients.get(userId)?.delete(res);
  };
}

export function broadcastToUser(userId: string, payload: unknown) {
  const userClients = clients.get(userId);
  console.log(
    `[broadcast] user ${userId}, clients: ${userClients?.size ?? 0}, payload:`,
    JSON.stringify(payload),
  );
  if (!userClients) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  userClients.forEach((res) => {
    try {
      res.write(data);
      console.log(`[broadcast] sent to client`);
    } catch (err) {
      console.error(`[broadcast] failed to send:`, err);
    }
  });
}
