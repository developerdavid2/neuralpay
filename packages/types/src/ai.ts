import z from "zod";
import {
  CHAT_CONTEXT_TYPES,
  CHAT_TOPICS,
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
  insightsSchema,
} from "@neuralpay/db/schema";

// ── Insight Schemas
export const insightFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  includeDismissed: z.boolean().default(false),
  type: z.enum(INSIGHT_TYPES).optional(),
  severity: z.enum(INSIGHT_SEVERITIES).optional(),
  search: z.string().trim().optional(),
});
export type InsightFilterInput = z.infer<typeof insightFilterSchema>;

export const insightPageSchema = z.object({
  items: z.array(insightsSchema),
  nextCursor: z.string().nullable(),
});
export type InsightPage = z.infer<typeof insightPageSchema>;

export const insightDataSchema = z
  .object({
    amount: z.number().optional(),
    percentage: z.number().optional(),
    merchant: z.string().optional(),
    trendDirection: z.enum(["up", "down", "stable"]).optional(),
    comparisonPeriod: z.string().optional(),
  })
  .loose();
export type InsightData = z.infer<typeof insightDataSchema>;

// ── Chat Schemas
export const startChatSessionBaseSchema = z.object({
  contextType: z.enum(CHAT_CONTEXT_TYPES).default("general"),
  contextId: z.string().optional(),
  title: z.string().min(1).max(100).optional(),
  topic: z.enum(CHAT_TOPICS).default("general"),
});

// Refined schema for mutation input
export const startChatSessionSchema = startChatSessionBaseSchema.refine(
  (data) => data.contextType === "general" || !!data.contextId,
  {
    message: "contextId is required when contextType is not 'general'",
  },
);

export type StartChatSessionInput = z.infer<typeof startChatSessionSchema>;

export const sessionByIdSchema = z.object({
  sessionId: z.uuid(),
});
export type SessionByIdInput = z.infer<typeof sessionByIdSchema>;

export const chatFilterSchema = z.object({
  includeDismissed: z.boolean().default(false),
  contextType: z.enum(CHAT_CONTEXT_TYPES).optional(),
});
export type ChatFilterInput = z.infer<typeof chatFilterSchema>;

export const sendMessageSchema = z.object({
  sessionId: z.uuid(),
  content: z.string().min(1).max(4000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ── Combined inputs
export const listInsightsInputSchema = insightFilterSchema;
export type ListInsightsInput = z.infer<typeof listInsightsInputSchema>;

export const listSessionsInputSchema = chatFilterSchema;
export type ListSessionsInput = z.infer<typeof listSessionsInputSchema>;
