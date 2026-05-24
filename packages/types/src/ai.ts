import z from "zod";

export const INSIGHT_TYPES = [
  "anomaly",
  "opportunity",
  "trend",
  "saving",
  "warning",
] as const;

export const INSIGHT_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const CHAT_CONTEXT_TYPES = [
  "insight",
  "transaction",
  "budget",
  "vault",
  "split",
  "general",
] as const;

export const CHAT_TOPICS = [
  "budgeting",
  "spending",
  "savings",
  "general",
] as const;

export const ROLES = ["user", "assistant"] as const;

export type InsightType = (typeof INSIGHT_TYPES)[number];
export type InsightSeverity = (typeof INSIGHT_SEVERITIES)[number];
export type ChatContextType = (typeof CHAT_CONTEXT_TYPES)[number];
export type Topic = (typeof CHAT_TOPICS)[number];
export type Role = (typeof ROLES)[number];

export const insightSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  type: z.enum(INSIGHT_TYPES),
  title: z.string(),
  description: z.string(),
  severity: z.enum(INSIGHT_SEVERITIES).nullable(),
  category: z.string().nullable(),
  data: z.string().nullable(),
  readAt: z.date().nullable(),
  dismissedAt: z.date().nullable(),
  generatedAt: z.date(),
  expiresAt: z.date().nullable(),
});

export type InsightRecord = z.infer<typeof insightSchema>;

export const insightFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  includeDismissed: z.boolean().default(false),
  type: z.enum(INSIGHT_TYPES).optional(),
  severity: z.enum(INSIGHT_SEVERITIES).optional(),
  readStatus: z.enum(["all", "read", "unread"]).default("all"),
  search: z.string().trim().optional(),
});

export type InsightFilterInput = z.infer<typeof insightFilterSchema>;

export const startChatSessionSchema = z
  .object({
    contextType: z.enum(CHAT_CONTEXT_TYPES).default("general"),
    contextId: z.string().optional(),
    title: z.string().min(1).max(100).optional(),
    topic: z.enum(CHAT_TOPICS).default("general"),
  })
  .refine((data) => data.contextType === "general" || !!data.contextId, {
    message: "contextId is required when contextType is not 'general'",
  });

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
