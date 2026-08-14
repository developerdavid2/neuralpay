import { db } from "@neuralpay/db";
import { chatMessages } from "@neuralpay/db/schema";
import {
  CONTEXT_TOOL_SCOPE,
  type StreamChatRequest,
  type StreamChatResponse,
} from "@neuralpay/types";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { and, eq } from "drizzle-orm";
import type { Response } from "express";
import { fetchContext } from "../context";
import { getModel } from "../lib/ai-provider";
import { buildSystemPrompt } from "../lib/prompt";
import { buildTools } from "../tools";
import { AICoachService } from "./coach.service";

const MAX_HISTORY_MESSAGES = 15;

function scopedTools(
  allTools: ReturnType<typeof buildTools>,
  contextType: string,
) {
  // Default-deny: an unknown/unlisted context never widens to "all tools".
  const allowed = CONTEXT_TOOL_SCOPE[contextType] ?? [];
  return Object.fromEntries(
    Object.entries(allTools).filter(([name]) => allowed.includes(name)),
  );
}

export async function fetchMessageHistory(
  sessionId: string,
  userId: string,
): Promise<UIMessage[]> {
  const history = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.sessionId, sessionId),
        eq(chatMessages.userId, userId),
      ),
    )
    .orderBy(chatMessages.createdAt)
    .limit(MAX_HISTORY_MESSAGES);

  return history.map((msg) => {
    let parts: UIMessage["parts"];

    // Try to parse as JSON (new format: UIMessage parts)
    try {
      const parsed = JSON.parse(msg.content);
      // Validate it's an array of parts (new format)
      if (Array.isArray(parsed)) {
        parts = parsed;
      } else {
        // Old format: plain text wrapped in a text part
        parts = [{ type: "text", text: String(msg.content) }];
      }
    } catch {
      // JSON parse failed — old plain-text format
      parts = [{ type: "text", text: String(msg.content) }];
    }

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts,
    };
  });
}

export async function handleStreamChat(
  req: StreamChatRequest,
  res: Response,
): Promise<StreamChatResponse> {
  const { sessionId, userId, content, planTier = "free" } = req;

  try {
    // 1. Session & quota
    const sessionResult = await AICoachService.getOrCreateSession(userId, {
      sessionId,
    });
    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error,
        code: sessionResult.code,
      };
    }
    const resolvedSessionId = sessionResult.data.id;

    const quotaResult = await AICoachService.checkQuota(userId, planTier);
    if (!quotaResult.success) {
      return { success: false, error: quotaResult.error, code: "RATE_LIMITED" };
    }

    // 2. Build + save the user message as a UIMessage (parts, not raw string)
    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: content }],
    };

    const saveUserResult = await AICoachService.saveMessage(
      resolvedSessionId,
      userId,
      "user",
      userMessage.parts,
    );
    if (!saveUserResult.success) {
      return {
        success: false,
        error: saveUserResult.error,
        code: "INTERNAL_SERVER_ERROR",
      };
    }

    // 3. Fetch context & history
    const { data: contextData, snapshot } = await fetchContext(
      userId,
      sessionResult.data.contextType ?? "general",
      sessionResult.data.contextId,
    );

    // fetchMessageHistory now returns UIMessage[] (parts intact) — see note below
    const history: UIMessage[] = await fetchMessageHistory(
      resolvedSessionId,
      userId,
    );

    const originalMessages: UIMessage[] = [...history, userMessage];

    const systemPrompt = buildSystemPrompt(
      contextData,
      sessionResult.data.contextType ?? "",
    );

    // 4. Stream
    const result = streamText({
      model: getModel(),
      system: systemPrompt,
      messages: await convertToModelMessages(originalMessages),
      tools: scopedTools(
        buildTools(userId),
        sessionResult.data.contextType ?? "general",
      ),
      stopWhen: ({ steps }) => steps.length >= 5,
      onError: ({ error }) => {
        console.error("[handleStreamChat] streamText error:", error);
      },
    });

    // Don't await the stream — let it run in the background even if the
    // client disconnects, so persistence still completes.
    result.consumeStream();

    const uiStream = toUIMessageStream({
      stream: result.stream,
      originalMessages,
      onFinish: async ({ messages }) => {
        // `messages` = full UIMessage[] for this turn, including the new
        // assistant message with parts in the exact order they streamed
        // (text, tool calls, tool results, more text — all preserved).
        const assistantMessage = messages[messages.length - 1];

        const metadata = JSON.stringify({
          contextSnapshot: snapshot,
          model: process.env.AI_MODEL,
        });

        await AICoachService.saveMessage(
          resolvedSessionId,
          userId,
          "assistant",
          assistantMessage?.parts!,
          undefined,
          metadata,
        );
      },
      onError: (error) => {
        console.error("[handleStreamChat] stream error:", error);
        return "Something went wrong generating a response.";
      },
    });

    // Convert the Web Response from createUIMessageStreamResponse into the
    // Express response manually — avoids relying on an unverified
    // Express-specific convenience method for this `ai` version.
    const response = createUIMessageStreamResponse({ stream: uiStream });

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[handleStreamChat]", err);
    return {
      success: false,
      error: err.message,
      code: "INTERNAL_SERVER_ERROR",
    };
  }
}
