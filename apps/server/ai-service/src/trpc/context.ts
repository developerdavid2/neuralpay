import { createExpressContext } from "@orra/config/trpc";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export function createContext(opts: CreateExpressContextOptions) {
  return createExpressContext({ req: opts.req });
}
