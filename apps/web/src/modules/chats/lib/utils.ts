import type { ChatSession } from "@neuralpay/types";

export function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const recent: ChatSession[] = [];
  const earlier: ChatSession[] = [];

  for (const session of sessions) {
    const updated = new Date(session.updatedAt);
    if (updated >= yesterday) {
      recent.push(session);
    } else {
      earlier.push(session);
    }
  }

  return { recent, earlier };
}
