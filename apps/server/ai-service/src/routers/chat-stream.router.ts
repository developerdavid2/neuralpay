import type { Request, Response } from "express";
import { z } from "zod";
import { fromNodeHeaders } from "better-auth/node";
import { handleStreamChat } from "../services/streaming.service";
import { auth } from "@neuralpay/auth";
const streamRequestSchema = z.object({
  sessionId: z.uuid(),
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
  let userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    try {
      const headers = fromNodeHeaders(req.headers);
      const session = await auth.api.getSession({ headers });
      userId = session?.user?.id;
    } catch {
      // session validation failed
    }
  }

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const planTier = (req.headers["x-user-plan"] as string) ?? "free";

  const parseResult = streamRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { sessionId, messages } = parseResult.data;

  // Extract the last user message text from parts
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
