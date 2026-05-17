import { db } from "@neuralpay/db";
import { insights, type InsightRecord } from "@neuralpay/db/schema";
import type { InsightFilterInput, ServiceResult } from "@neuralpay/types";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export const AIInsightsService = {
  async getInsights(
    userId: string,
    filters: InsightFilterInput,
  ): Promise<ServiceResult<InsightRecord[]>> {
    try {
      const { limit, includeArchived, type, severity } = filters;

      const conditions = [eq(insights.userId, userId)];

      if (!includeArchived) {
        conditions.push(isNull(insights.dismissedAt));
      }

      if (type) {
        conditions.push(eq(insights.type, type));
      }

      if (severity) {
        conditions.push(eq(insights.severity, severity));
      }

      const result = await db
        .select()
        .from(insights)
        .where(and(...conditions))
        .orderBy(
          // Unread first, then by generated date
          sql`${insights.readAt} IS NULL DESC`,
          desc(insights.generatedAt),
        )
        .limit(limit);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("[AIService.getInsights]", err);
      return {
        success: false,
        error: "Failed to fetch insights",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  //  * Get recent active insights (for dashboard)
  async getRecentInsights(
    userId: string,
    limit = 5,
  ): Promise<ServiceResult<InsightRecord[]>> {
    try {
      const result = await db
        .select()
        .from(insights)
        .where(and(eq(insights.userId, userId), isNull(insights.dismissedAt)))
        .orderBy(
          sql`${insights.readAt} IS NULL DESC`,
          desc(insights.generatedAt),
        )
        .limit(limit);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("[AIService.getRecentInsights]", err);
      return {
        success: false,
        error: "Failed to fetch recent insights",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  //  * Get single insight by ID with parsed data
  async getInsightById(
    userId: string,
    insightId: string,
  ): Promise<ServiceResult<InsightRecord>> {
    try {
      const [result] = await db
        .select()
        .from(insights)
        .where(and(eq(insights.id, insightId), eq(insights.userId, userId)))
        .limit(1);

      if (!result) {
        return {
          success: false,
          error: "Insight not found",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("[AIService.getInsightById]", err);
      return {
        success: false,
        error: "Failed to fetch insight",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  //  * Archive (dismiss) an insight
  async dismissInsight(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string; dismissedAt: Date }>> {
    try {
      const dismissedAt = new Date();
      const [result] = await db
        .update(insights)
        .set({ dismissedAt })
        .where(and(eq(insights.id, id), eq(insights.userId, userId)))
        .returning({ id: insights.id });

      if (!result) {
        return {
          success: false,
          error: "Insight not found",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: { id: result.id, dismissedAt },
      };
    } catch (err) {
      console.error("[AIService.dismissInsight]", err);
      return {
        success: false,
        error: "Failed to dismiss insight",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  //  * Restore an archived insight
  async restoreInsight(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const [result] = await db
        .update(insights)
        .set({ dismissedAt: null })
        .where(and(eq(insights.id, id), eq(insights.userId, userId)))
        .returning({ id: insights.id });

      if (!result) {
        return {
          success: false,
          error: "Insight not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: { id: result.id } };
    } catch (err) {
      console.error("[AIService.restoreInsight]", err);
      return {
        success: false,
        error: "Failed to restore insight",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },

  //  * Mark insight as read (idempotent)
  async markInsightRead(
    id: string,
    userId: string,
  ): Promise<ServiceResult<{ id: string; readAt: Date }>> {
    try {
      const readAt = new Date();
      const [result] = await db
        .update(insights)
        .set({ readAt })
        .where(
          and(
            eq(insights.id, id),
            eq(insights.userId, userId),
            isNull(insights.readAt), // Only update if not already read
          ),
        )
        .returning({ id: insights.id });

      // If already read, still return success
      if (!result) {
        // Check if insight exists and is already read
        const [existing] = await db
          .select({ id: insights.id, readAt: insights.readAt })
          .from(insights)
          .where(and(eq(insights.id, id), eq(insights.userId, userId)))
          .limit(1);

        if (!existing) {
          return {
            success: false,
            error: "Insight not found",
            code: "NOT_FOUND",
          };
        }

        return {
          success: true,
          data: { id: existing.id, readAt: existing.readAt! },
        };
      }

      return {
        success: true,
        data: { id: result.id, readAt },
      };
    } catch (err) {
      console.error("[AIService.markInsightRead]", err);
      return {
        success: false,
        error: "Failed to mark insight as read",
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  },
} as const;
