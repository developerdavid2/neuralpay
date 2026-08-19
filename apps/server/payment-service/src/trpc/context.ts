import { createFastifyContext } from "@orra/config/trpc";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { BaseContext } from "@orra/config/trpc";

export async function createContext(
  opts: CreateFastifyContextOptions,
): Promise<BaseContext> {
  return createFastifyContext({ req: opts.req });
}
