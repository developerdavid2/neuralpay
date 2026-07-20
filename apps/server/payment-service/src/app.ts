import type { FastifyInstance, FastifyServerOptions } from "fastify";
import { router } from "./routes.js";

// Remove `done` from the parameters and let async handling take care of it
async function app(instance: FastifyInstance, _: FastifyServerOptions) {
  // Base root route check
  instance.get("/", async () => {
    return { status: "alive", message: "Welcome to Payment Service Root" };
  });

  await instance.register(router, { prefix: "/" });
}

export default app;
