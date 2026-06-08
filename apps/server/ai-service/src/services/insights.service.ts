import { db } from "@neuralpay/db";
import { insights } from "@neuralpay/db/schema";
import type {
  InsightFilterInput,
  InsightRecord,
  ServiceResult,
} from "@neuralpay/types";
import { and, desc, eq, isNull, sql, or, ilike } from "drizzle-orm";

export const AIInsightsService = {
  async getInsights(
    userId: string,
    filters: InsightFilterInput,
  ): Promise<
    ServiceResult<{ items: InsightRecord[]; nextCursor: string | null }>
  > {
    try {
      const {
        limit,
        cursor,
        includeDismissed,
        type,
        severity,
        readStatus,
        search,
      } = filters;

      const conditions = [eq(insights.userId, userId)];

      if (!includeDismissed) {
        conditions.push(isNull(insights.dismissedAt));
      }

      if (type) {
        conditions.push(eq(insights.type, type));
      }

      if (severity) {
        conditions.push(eq(insights.severity, severity));
      }

      if (readStatus === "read") {
        conditions.push(sql`${insights.readAt} IS NOT NULL`);
      } else if (readStatus === "unread") {
        conditions.push(isNull(insights.readAt));
      }

      if (search) {
        const searchCondition = or(
          ilike(insights.title, `%${search}%`),
          ilike(insights.description, `%${search}%`),
        );

        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Cursor-based pagination: decode cursor to get the ID
      if (cursor) {
        const cursorId = Buffer.from(cursor, "base64").toString("utf-8");
        const [cursorRow] = await db
          .select({ id: insights.id, generatedAt: insights.generatedAt })
          .from(insights)
          .where(and(eq(insights.id, cursorId), eq(insights.userId, userId)))
          .limit(1);

        if (cursorRow) {
          const cursorRowCondition = or(
            sql`${insights.generatedAt} < ${cursorRow.generatedAt}`,
            and(
              eq(insights.generatedAt, cursorRow.generatedAt),
              sql`${insights.id} < ${cursorRow.id}`,
            ),
          );
          if (cursorRowCondition) {
            conditions.push(cursorRowCondition);
          }
        }
      }

      const result = await db
        .select()
        .from(insights)
        .where(and(...conditions))
        .orderBy(desc(insights.generatedAt), desc(insights.id))
        .limit(limit + 1);

      const hasMore = result.length > limit;
      const items = result.slice(0, limit);
      const nextCursor = hasMore
        ? Buffer.from(items[items.length - 1]!.id).toString("base64")
        : null;

      return {
        success: true,
        data: { items, nextCursor },
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
            isNull(insights.readAt),
          ),
        )
        .returning({ id: insights.id });

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
