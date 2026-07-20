import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import app from "./app.js";

const fastify = Fastify({ logger: true });

// Register the app logic under the root prefix
await fastify.register(app, { prefix: "/" });

export default async (req: FastifyRequest, res: FastifyReply) => {
  try {
    await fastify.ready();
    // Intercept serverless lifecycle and emit to Fastify's raw core engine
    fastify.server.emit("request", req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
