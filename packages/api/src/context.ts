// packages/api/src/context.ts
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";

// Use a plain interface with no Express internals exposed
// This is what gets exported and referenced by routers
export interface Context {
  _headers: Headers;
}

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<Context> {
  return {
    _headers: fromNodeHeaders(opts.req.headers),
  };
}
