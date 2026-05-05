import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  cursor: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ── Generic paginated result
export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};
