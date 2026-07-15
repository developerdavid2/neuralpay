import { createExpressContext } from "@neuralpay/config/trpc";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(opts: CreateExpressContextOptions) {
  const base = await createExpressContext({ req: opts.req });
  return { ...base, resHeaders: opts.res };
}
