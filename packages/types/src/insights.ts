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

export type InsightType = (typeof INSIGHT_TYPES)[number];
export type InsightSeverity = (typeof INSIGHT_SEVERITIES)[number];

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
export type ListInsightsInput = z.infer<typeof insightFilterSchema>;
