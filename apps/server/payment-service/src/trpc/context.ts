import { auth } from "@neuralpay/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { BaseContext } from "@neuralpay/config/trpc";

export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<BaseContext> {
  const headers = fromNodeHeaders(req.headers);
  const session = await auth.api.getSession({ headers });
  return { session, _headers: headers };
}
