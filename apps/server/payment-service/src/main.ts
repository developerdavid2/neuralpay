import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

const PORT = Number(process.env.PORT) || 4002;
const app = Fastify({ logger: true });

await app.register(helmet);
await app.register(cors, { origin: ["http://localhost:3000"], credentials: true });
await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

app.get("/health", async () => ({
  status: "ok",
  service: "payment-service",
  port: PORT,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// TODO: Register transactions/accounts/provider/vaults/splits/webhooks routes with Fastify plugins.
await app.listen({ port: PORT, host: "0.0.0.0" });
console.log(`🚀 payment-service running on http://localhost:${PORT}`);
