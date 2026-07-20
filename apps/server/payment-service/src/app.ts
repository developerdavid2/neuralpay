import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { TRPCError } from "@trpc/server";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { paymentsRouter } from "./routers/index.js";
import { createContext } from "./trpc/context";

const PORT = Number(process.env.PORT) || 4002;
const server = Fastify({ logger: true });

await server.register(helmet);
await server.register(rateLimit, { max: 200, timeWindow: "1 minute" });

server.get("/health", async () => ({
  status: "ok",
  service: "payment-service",
  port: PORT,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: paymentsRouter,
    createContext,
    onError({ path, error }: { path: string | undefined; error: TRPCError }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(
          `[tRPC payment-service] error on /${path}:`,
          error.message,
        );
      }
    },
  },
});

try {
  await server.listen({ port: PORT, host: "0.0.0.0" });
  server.log.info(`🚀 payment-service running on http://localhost:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
