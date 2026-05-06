import { auth } from "@neuralpay/auth";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { BaseContext } from "@neuralpay/config/trpc";

export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<BaseContext> {
  const headers = new Headers(req.headers as Record<string, string>);
  const session = await auth.api.getSession({ headers });
  return { session, _headers: headers };
}
