import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { TRPCError } from "@trpc/server";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { paymentsRouter } from "./routers/index.js";
import { createContext } from "./trpc/context";

const server = Fastify({ logger: true });

// Register plugins
await server.register(helmet);
await server.register(rateLimit, { max: 200, timeWindow: "1 minute" });

// Health Check
server.get("/health", async () => ({
  status: "ok",
  service: "payment-service",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// Register tRPC
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

// The Vercel Request Bridge
export default async (req: any, res: any) => {
  try {
    await server.ready();
    // Manually emit the request straight into Fastify's underlying node engine
    server.server.emit("request", req, res);
  } catch (error) {
    server.log.error(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
