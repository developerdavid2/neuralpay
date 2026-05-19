import { db } from "@neuralpay/db";
import {
  aiUsage,
  chatMessages,
  chatSessions,
  type AIUsageRecord,
  type ChatMessageRecord,
  type ChatSessionRecord,
} from "@neuralpay/db/schema";
import type { ChatFilterInput, ServiceResult } from "@neuralpay/types";
import { and, desc, eq, isNull } from "drizzle-orm";

// ── Helper: Check AI quota
async function checkAIQuota(
  userId: string,
  planTier: string,
): Promise<ServiceResult<boolean>> {
  if (planTier !== "free") return { success: true, data: true };

  const now = new Date();
  const [usage] = await db
    .select()
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.userId, userId),
        eq(aiUsage.month, now.getMonth() + 1),
        eq(aiUsage.year, now.getFullYear()),
      ),
    )
    .limit(1);

  if (!usage) return { success: true, data: true };

  if (usage.queryCount >= 20) {
    return {
      success: false,
      error:
        "AI query limit reached for free tier. Upgrade to Pro for unlimited queries.",
      code: "RATE_LIMITED",
    };
  }

  return { success: true, data: true };
}

// ── Helper: Increment AI usage

export const AICoachService = {
  async getSessions(
    userId: string,
    filters: ChatFilterInput,
  ): Promise<ServiceResult<ChatSessionRecord[]>> {
    try {
      const { includeDismissed, contextType } = filters;

      const conditions = [
        eq(chatSessions.userId, userId),
        eq(chatSessions.isActive, true),
      ];

      if (!includeDismissed) {
        conditions.push(isNull(chatSessions.archivedAt));
      }

      if (contextType) {
        conditions.push(eq(chatSessions.contextType, contextType));
      }

      const result = await db
        .select()
        .from(chatSessions)
        .where(and(...conditions))
        .orderBy(desc(chatSessions.updatedAt));

      return { success: true, data: result };
    } catch (err) {
      console.error("[AICoachService.getSessions]", err);
      return {
        success: false,
        error: "Failed to fetch chat sessions",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async getOrCreateSession(
    userId: string,
    options: {
      sessionId?: string;
      contextType?: string;
      contextId?: string;
      title?: string;
      topic?: string;
    } = {},
  ): Promise<ServiceResult<ChatSessionRecord>> {
    try {
      // Use existing session if provided and it belongs to the user
      if (options.sessionId) {
        const [existing] = await db
          .select()
          .from(chatSessions)
          .where(
            and(
              eq(chatSessions.id, options.sessionId),
              eq(chatSessions.userId, userId),
              eq(chatSessions.isActive, true),
            ),
          )
          .limit(1);

        if (existing) {
          return { success: true, data: existing };
        }
      }

      // Generate contextual title if not provided
      let title = options.title;
      if (
        !title &&
        options.contextType &&
        options.contextType !== "general" &&
        options.contextId
      ) {
        title = `Chat about ${options.contextType}`;
      }
      if (!title) {
        title = "New conversation";
      }

      type NewChatSession = typeof chatSessions.$inferInsert;

      const insertValues: NewChatSession = {
        userId,
        title,
        topic: (options.topic ?? "general") as NewChatSession["topic"],
        contextType: (options.contextType ??
          "general") as NewChatSession["contextType"],
        contextId: options.contextId ?? null, // ← null not undefined, matches string | null
        isActive: true,
      };

      const [newSession] = await db
        .insert(chatSessions)
        .values(insertValues)
        .returning();

      if (!newSession) {
        return {
          success: false,
          error: "Failed to create session",
          code: "INTERNAL_SERVER_ERROR",
        };
      }
      return { success: true, data: newSession };
    } catch (err) {
      console.error("[AICoachService.getOrCreateSession]", err);
      return {
        success: false,
        error: "Failed to get or create session",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async getMessages(
    sessionId: string,
    userId: string,
  ): Promise<ServiceResult<ChatMessageRecord[]>> {
    try {
      // Verify session belongs to user first
      const [session] = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)),
        )
        .limit(1);

      if (!session) {
        return {
          success: false,
          error: "Session not found",
          code: "NOT_FOUND",
        };
      }

      const result = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);

      return { success: true, data: result };
    } catch (err) {
      console.error("[AICoachService.getMessages]", err);
      return {
        success: false,
        error: "Failed to fetch messages",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async saveMessage(
    sessionId: string,
    userId: string,
    role: "user" | "assistant",
    content: string,
    tokensUsed?: number,
  ): Promise<ServiceResult<ChatMessageRecord>> {
    try {
      const [message] = await db
        .insert(chatMessages)
        .values({ sessionId, userId, role, content, tokensUsed })
        .returning();

      // Update session updatedAt so it sorts to top
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, sessionId));

      if (!message) {
        return {
          success: false,
          error: "Failed to save message",
          code: "INTERNAL_SERVER_ERROR",
        };
      }
      return { success: true, data: message };
    } catch (err) {
      console.error("[AICoachService.saveMessage]", err);
      return {
        success: false,
        error: "Failed to save message",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async deleteSession(
    sessionId: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [result] = await db
        .delete(chatSessions)
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)),
        )
        .returning({ id: chatSessions.id });

      if (!result) {
        return {
          success: false,
          error: "Session not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: { id: result.id } };
    } catch (err) {
      console.error("[AICoachService.deleteSession]", err);
      return {
        success: false,
        error: "Failed to delete session",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },
  async archiveSession(
    sessionId: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [result] = await db
        .update(chatSessions)
        .set({ archivedAt: new Date() })
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)),
        )
        .returning({ id: chatSessions.id });

      if (!result) {
        return {
          success: false,
          error: "Session not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: { id: result.id } };
    } catch (err) {
      console.error("[AICoachService.archiveSession]", err);
      return {
        success: false,
        error: "Failed to archive session",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async checkQuota(
    userId: string,
    planTier: string,
  ): Promise<ServiceResult<boolean>> {
    return checkAIQuota(userId, planTier);
  },

  async getUsage(userId: string): Promise<ServiceResult<AIUsageRecord | null>> {
    try {
      const now = new Date();
      const [usage] = await db
        .select()
        .from(aiUsage)
        .where(
          and(
            eq(aiUsage.userId, userId),
            eq(aiUsage.month, now.getMonth() + 1),
            eq(aiUsage.year, now.getFullYear()),
          ),
        )
        .limit(1);

      return { success: true, data: usage ?? null };
    } catch (err) {
      console.error("[AICoachService.getUsage]", err);
      return {
        success: false,
        error: "Failed to fetch usage",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  async incrementAIUsage(
    userId: string,
    tokensUsed: number,
  ): Promise<ServiceResult<void>> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [existing] = await db
      .select()
      .from(aiUsage)
      .where(
        and(
          eq(aiUsage.userId, userId),
          eq(aiUsage.month, month),
          eq(aiUsage.year, year),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(aiUsage)
        .set({
          queryCount: existing.queryCount + 1,
          tokenCount: existing.tokenCount + tokensUsed,
          lastQueryAt: now,
          updatedAt: now,
        })
        .where(eq(aiUsage.id, existing.id));
    } else {
      await db.insert(aiUsage).values({
        userId,
        month,
        year,
        queryCount: 1,
        tokenCount: tokensUsed,
        lastQueryAt: now,
      });
    }

    return { success: true, data: undefined };
  },
} as const;
