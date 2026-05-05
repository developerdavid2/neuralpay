import { db } from "@neuralpay/db";
import {
  chatMessages,
  chatSessions,
  spendingInsights,
  type ChatMessageRecord,
  type ChatSessionRecord,
  type InsightRecord,
} from "@neuralpay/db/schema";
import type { ServiceResult } from "@neuralpay/types";
import { and, desc, eq, isNull } from "drizzle-orm";

export const AIService = {
  async getInsights(
    userId: string,
    limit = 10,
  ): Promise<ServiceResult<InsightRecord[]>> {
    try {
      const result = await db
        .select()
        .from(spendingInsights)
        .where(
          and(
            eq(spendingInsights.userId, userId),
            eq(spendingInsights.dismissed, false),
          ),
        )
        .orderBy(desc(spendingInsights.generatedAt))
        .limit(limit);

      return { success: true, data: result };
    } catch (err) {
      console.error("[AIService.getInsights]", err);
      return {
        success: false,
        error: "Failed to fetch insights",
        code: "DB_ERROR",
      };
    }
  },

  async dismissInsight(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const result = await db
        .update(spendingInsights)
        .set({ dismissed: true })
        .where(
          and(eq(spendingInsights.id, id), eq(spendingInsights.userId, userId)),
        )
        .returning({ id: spendingInsights.id });

      if (!result[0]) {
        return {
          success: false,
          error: "Insight not found",
          code: "NOT_FOUND",
        };
      }
      return { success: true, data: { id: result[0].id } };
    } catch (err) {
      console.error("[AIService.dismissInsight]", err);
      return {
        success: false,
        error: "Failed to dismiss insight",
        code: "DB_ERROR",
      };
    }
  },

  // ── Chat Sessions ─────────────────────────────────────────────────────────
  async getSessions(
    userId: string,
  ): Promise<ServiceResult<ChatSessionRecord[]>> {
    try {
      const result = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.userId, userId),
            eq(chatSessions.isActive, true),
            isNull(chatSessions.archivedAt),
          ),
        )
        .orderBy(desc(chatSessions.updatedAt));

      return { success: true, data: result };
    } catch (err) {
      console.error("[AIService.getSessions]", err);
      return {
        success: false,
        error: "Failed to fetch sessions",
        code: "DB_ERROR",
      };
    }
  },

  async getOrCreateSession(
    userId: string,
    sessionId?: string,
  ): Promise<ServiceResult<ChatSessionRecord>> {
    try {
      // Use existing session if provided and it belongs to the user
      if (sessionId) {
        const existing = await db
          .select()
          .from(chatSessions)
          .where(
            and(
              eq(chatSessions.id, sessionId),
              eq(chatSessions.userId, userId),
              eq(chatSessions.isActive, true),
            ),
          )
          .limit(1);

        if (existing[0]) {
          return { success: true, data: existing[0] };
        }
      }

      // Create new session
      const [newSession] = await db
        .insert(chatSessions)
        .values({
          userId,
          title: "New conversation",
          topic: "general",
          isActive: true,
        })
        .returning();

      if (!newSession) {
        return {
          success: false,
          error: "Failed to create session",
          code: "DB_ERROR",
        };
      }
      return { success: true, data: newSession };
    } catch (err) {
      console.error("[AIService.getOrCreateSession]", err);
      return {
        success: false,
        error: "Failed to get session",
        code: "DB_ERROR",
      };
    }
  },

  async getMessages(
    sessionId: string,
    userId: string,
  ): Promise<ServiceResult<ChatMessageRecord[]>> {
    try {
      // Verify session belongs to user first
      const session = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)),
        )
        .limit(1);

      if (!session[0]) {
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
      console.error("[AIService.getMessages]", err);
      return {
        success: false,
        error: "Failed to fetch messages",
        code: "DB_ERROR",
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
          code: "DB_ERROR",
        };
      }
      return { success: true, data: message };
    } catch (err) {
      console.error("[AIService.saveMessage]", err);
      return {
        success: false,
        error: "Failed to save message",
        code: "DB_ERROR",
      };
    }
  },
} as const;
