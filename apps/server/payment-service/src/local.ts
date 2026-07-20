import Fastify from "fastify";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 4002;
const fastify = Fastify({ logger: true });

await fastify.register(app, { prefix: "/" });

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  fastify.log.info(
    `🚀 local payment-service running on http://localhost:${PORT}`,
  );
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
