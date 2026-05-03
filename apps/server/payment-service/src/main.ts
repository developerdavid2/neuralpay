import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { paymentServiceEnv } from "@neuralpay/env/payment";

const PORT = Number(process.env.PORT) || 4002;
const server = Fastify({ logger: true });

await server.register(helmet);
await server.register(cors, {
  origin: [paymentServiceEnv.CORS_ORIGIN],
  credentials: true,
});

await server.register(rateLimit, { max: 200, timeWindow: "1 minute" });

server.get("/health", async () => ({
  status: "ok",
  service: "payment-service",
  port: PORT,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

try {
  await server.listen({ port: PORT, host: "0.0.0.0" });
  server.log.info(`🚀 payment-service running on http://localhost:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
