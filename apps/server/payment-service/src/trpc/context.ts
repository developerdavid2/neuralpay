import { createFastifyContext } from "@neuralpay/config/trpc";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { BaseContext } from "@neuralpay/config/trpc";

export async function createContext(
  opts: CreateFastifyContextOptions,
): Promise<BaseContext> {
  return createFastifyContext({ req: opts.req });
}
