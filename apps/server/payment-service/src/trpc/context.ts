import { createFastifyContext } from "@neuralpay/config/trpc";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export async function createContext(opts: CreateFastifyContextOptions) {
  const base = await createFastifyContext({ req: opts.req });
  return { ...base, resHeaders: opts.res };
}
