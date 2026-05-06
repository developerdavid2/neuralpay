import { auth } from "@neuralpay/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { BaseContext } from "@neuralpay/config/trpc";

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<BaseContext> {
  const headers = fromNodeHeaders(opts.req.headers);
  const session = await auth.api.getSession({ headers });
  return { session, _headers: headers };
}
