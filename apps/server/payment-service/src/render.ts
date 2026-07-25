// src/render.ts
import Fastify from "fastify";
import app from "./app.js";

const fastify = Fastify({ logger: true });

await fastify.register(app, { prefix: "/" });

const PORT = Number(process.env.PORT) || 4002;

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`🚀 payment-service running on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
