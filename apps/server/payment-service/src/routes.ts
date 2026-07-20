import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { TRPCError } from "@trpc/server";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { paymentsRouter } from "./routers/index.js";
import { createContext } from "./trpc/context.js";

export const router: FastifyPluginAsync = async (server: FastifyInstance) => {
  // Register security & rate limiting plugins inside the router plugin
  await server.register(helmet);
  await server.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  // 1. Health Check Route
  server.get("/health", async () => {
    return {
      status: "ok",
      service: "payment-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // 2. tRPC Plugin Route
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
};
