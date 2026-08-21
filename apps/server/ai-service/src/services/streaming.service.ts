import { db } from "@orra/db";
import { chatMessages } from "@orra/db/schema";
import {
  CONTEXT_TOOL_SCOPE,
  DEFAULT_CHAT_MODEL_ID,
  getToolContracts,
  type StreamChatRequest,
  type StreamChatResponse,
  type ToolMode,
} from "@orra/types";
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
import { getModel, getModelById } from "../lib/ai-provider";
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

function hasPendingToolCalls(message: UIMessage) {
  return message.parts.some((part) => {
    if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
      const state = (part as { state?: string }).state;
      return state !== "output-available" && state !== "output-error";
    }
    return false;
  });
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
  req: StreamChatRequest & { mode?: ToolMode; model?: string },
  res: Response,
): Promise<StreamChatResponse> {
  const {
    sessionId,
    userId,
    content,
    planTier = "free",
    mode = "plan",
    model: requestedModel,
  } = req;

  const startTime = Date.now();

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

    // 2. Fetch context & history BEFORE saving the new user message — the
    // freshly saved turn would otherwise show up in the history result AND be
    // appended below, handing the model (and UI stream) two copies of it.
    const { data: contextData, snapshot } = await fetchContext(
      userId,
      sessionResult.data.contextType ?? "general",
      sessionResult.data.contextId,
    );

    const history: UIMessage[] = await fetchMessageHistory(
      resolvedSessionId,
      userId,
    );

    // 3. Build + save the user message as a UIMessage (parts, not raw string)
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

    // History ends with the previous assistant turn; the current user turn is
    // appended exactly once below.
    const originalMessages: UIMessage[] = [...history, userMessage];

    const systemPrompt = buildSystemPrompt(
      contextData,
      sessionResult.data.contextType ?? "",
    );

    // 4. Resolve model: requested > session default > global default
    let resolvedModel;
    if (requestedModel) {
      resolvedModel = getModelById(requestedModel);
    } else {
      resolvedModel = getModel();
    }

    // 5. Resolve tools: primary filter by mode, secondary defense by context
    const contextType = sessionResult.data.contextType ?? "general";
    const modeTools = Object.keys(
      getToolContractsForFiltering(mode, contextType),
    );

    const allTools = buildTools(userId);
    const contextTools = scopedTools(allTools, contextType);

    // Intersection: mode allows AND context allows
    const filteredTools = Object.fromEntries(
      Object.entries(contextTools).filter(([name]) => modeTools.includes(name)),
    );

    // 6. Stream
    // maxRetries: 1 — a 429 on the AI Gateway free tier is account-wide and
    // won't clear within the SDK's short backoff; retrying 3x (the default)
    // only triples request count and burns rate-limit quota faster.
    const result = streamText({
      model: resolvedModel,
      system: systemPrompt,
      messages: await convertToModelMessages(originalMessages),
      tools: filteredTools,
      maxRetries: 1,
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
        const assistantMessage = messages[messages.length - 1];

        // Only save if there are no pending tool calls
        if (assistantMessage && !hasPendingToolCalls(assistantMessage)) {
          const duration = Date.now() - startTime;

          const metadata = JSON.stringify({
            contextSnapshot: snapshot,
            mode,
            model: requestedModel ?? DEFAULT_CHAT_MODEL_ID,
            duration,
          });

          await AICoachService.saveMessage(
            resolvedSessionId,
            userId,
            "assistant",
            assistantMessage.parts,
            undefined,
            metadata,
          );
        }
      },
      onError: (error) => {
        console.error("[handleStreamChat] stream error:", error);
        return error instanceof Error ? error.message : String(error);
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

function getToolContractsForFiltering(mode: ToolMode, contextType: string) {
  const modeTools = getToolContracts(mode);
  const allowed = CONTEXT_TOOL_SCOPE[contextType] ?? [];
  return Object.fromEntries(
    Object.entries(modeTools).filter(([name]) => allowed.includes(name)),
  );
}
