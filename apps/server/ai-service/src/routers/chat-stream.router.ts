import type { Request, Response } from "express";
import { z } from "zod";
import { handleStreamChat } from "../services/streaming.service";

function getHeaderValue(headers: Request["headers"], key: string) {
  const value = headers[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

const streamRequestSchema = z.object({
  sessionId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      parts: z.array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
        }),
      ),
      id: z.string(),
    }),
  ),
});

export async function chatStreamHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const forwardedUserId = getHeaderValue(req.headers, "x-user-id");
  const forwardedSource = getHeaderValue(req.headers, "x-internal-source");
  const forwardedPlanTier = getHeaderValue(req.headers, "x-user-plan-tier");

  if (forwardedSource !== "api-gateway" || !forwardedUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = forwardedUserId;
  const planTier = forwardedPlanTier ?? "free";

  const parseResult = streamRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { sessionId, messages } = parseResult.data;

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const content =
    lastUserMessage?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ?? "";

  if (!content) {
    res.status(400).json({ error: "No user message content found" });
    return;
  }

  const result = await handleStreamChat(
    { sessionId, userId, content, planTier },
    res,
  );

  if (!result.success && !res.headersSent) {
    res.status(500).json({ error: result.error, code: result.code });
  }
}
