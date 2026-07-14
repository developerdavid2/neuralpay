// src/adapters/express.ts
import { createRouteHandler } from "uploadthing/express";
import type { Express } from "express";
import type { FileRouter } from "uploadthing/express";

export function mountUploadThing<TRouter extends FileRouter>(
  app: Express,
  opts: {
    router: TRouter;
    path?: string;
    config?: Parameters<typeof createRouteHandler>[0]["config"];
  },
) {
  app.use(
    opts.path ?? "/api/uploadthing",
    createRouteHandler({
      router: opts.router,
      config: opts.config,
    }),
  );
}
