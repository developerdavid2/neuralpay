import { createExpressContext } from "@neuralpay/config/trpc";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { BaseContext } from "@neuralpay/config/trpc";

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<BaseContext> {
  return createExpressContext({ req: opts.req });
}
