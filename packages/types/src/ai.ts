import z from "zod";
import { paginationSchema } from "./pagination";

export const sendMessageSchema = z.object({
  sessionId: z.string().uuid().optional(), // omit to start a new session
  message: z.string().min(1).max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ── Insight filters ─────────────────────────────────────────────────────────
export const insightFilterSchema = z.object({
  category: z.enum(["budgeting", "spending", "savings", "general"]).optional(),
  type: z.enum(["anomaly", "summary", "recommendation"]).optional(),
  dismissed: z.boolean().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
});

export type InsightFilterInput = z.infer<typeof insightFilterSchema>;

// Combined input for list endpoint: filters + pagination
export const listInsightsInputSchema = insightFilterSchema.extend(
  paginationSchema.shape,
);
export type ListInsightsInput = z.infer<typeof listInsightsInputSchema>;

// ── Session filters ─────────────────────────────────────────────────────────
export const sessionFilterSchema = z.object({
  topic: z.enum(["budgeting", "spending", "savings", "general"]).optional(),
  isActive: z.boolean().optional(),
  archived: z.boolean().optional(), // true = archived, false = not archived, omit = both
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
});

export type SessionFilterInput = z.infer<typeof sessionFilterSchema>;
