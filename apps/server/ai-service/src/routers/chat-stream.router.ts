import { streamRequestSchema } from "@neuralpay/types";
import type { Request, Response } from "express";
import { handleStreamChat } from "../services/streaming.service";

export async function chatStreamHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = (req as any).user?.id;
  const planTier = (req as any).user?.planTier ?? "free";

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parseResult = streamRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { sessionId, content } = parseResult.data;

  const result = await handleStreamChat(
    { sessionId, userId, content, planTier },
    res,
  );

  if (!result.success && !res.headersSent) {
    res.status(500).json({ error: result.error, code: result.code });
  }
}
