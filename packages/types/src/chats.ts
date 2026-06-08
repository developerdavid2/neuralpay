import z from "zod";

export const CHAT_CONTEXT_TYPES = [
  "insight",
  "transaction",
  "budget",
  "vault",
  "split",
  "general",
] as const;

export const CHAT_TOPICS_TYPES = [
  "budgeting",
  "spending",
  "savings",
  "general",
] as const;

export const ROLES = ["user", "assistant"] as const;

export type ChatContextType = (typeof CHAT_CONTEXT_TYPES)[number];
export type Topic = (typeof CHAT_TOPICS_TYPES)[number];
export type Role = (typeof ROLES)[number];

export const chatSessionSchema = z
  .object({
    contextType: z.enum(CHAT_CONTEXT_TYPES).default("general"),
    contextId: z.string().optional(),
    title: z.string().min(1).max(100).optional(),
    topic: z.enum(CHAT_TOPICS_TYPES).default("general"),
  })
  .refine((data) => data.contextType === "general" || !!data.contextId, {
    message: "contextId is required when contextType is not 'general'",
  });

export const sendMessageSchema = z.object({
  sessionId: z.uuid(),
  content: z.string().min(1).max(4000),
});

export const chatFilterSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  includeArchived: z.boolean().default(false),
  contextType: z.enum(CHAT_CONTEXT_TYPES).optional(),
  topic: z.enum(CHAT_CONTEXT_TYPES).optional(),
  search: z.string().trim().optional(),
});

export type ChatSessionInput = z.infer<typeof chatSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ChatFilterInput = z.infer<typeof chatFilterSchema>;
export type ListSessionsInput = z.infer<typeof chatFilterSchema>;
