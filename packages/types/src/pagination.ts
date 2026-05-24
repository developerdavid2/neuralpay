import { z } from "zod";

export const createPaginatedSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) => {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};
