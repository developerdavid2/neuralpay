// src/adapters/fastify.ts
import { createRouteHandler } from "uploadthing/fastify";
import type { FastifyInstance } from "fastify";
import type { FileRouter } from "uploadthing/fastify";

type FastifyRouteHandlerOptions<TRouter extends FileRouter> = Parameters<
  typeof createRouteHandler<TRouter>
>[1];

export async function mountUploadThing<TRouter extends FileRouter>(
  app: FastifyInstance,
  opts: {
    router: TRouter;
    config?: FastifyRouteHandlerOptions<TRouter>["config"];
  },
) {
  await app.register(createRouteHandler, {
    router: opts.router,
    config: opts.config,
  } satisfies FastifyRouteHandlerOptions<TRouter>);
}
