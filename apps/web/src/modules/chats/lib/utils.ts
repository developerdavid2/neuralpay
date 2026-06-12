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

export function sanitizeMessageContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let sanitized = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
}
