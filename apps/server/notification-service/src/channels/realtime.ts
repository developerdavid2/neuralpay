import { publishToUser } from "@orra/redis";

export async function broadcastToUser(
  userId: string,
  payload: unknown,
): Promise<void> {
  console.log(`[broadcast] user ${userId}, payload:`, JSON.stringify(payload));
  await publishToUser(userId, payload);
}
