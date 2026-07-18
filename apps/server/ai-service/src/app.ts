import { aiServiceEnv } from "@neuralpay/env/ai-service";
import express, { type Express } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { aiRouter } from "./routers";
import { createContext } from "./trpc/context";
import { chatStreamHandler } from "./routers/chat-stream.router";

const app: Express = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: aiRouter,
    createContext,
  }),
);

app.post("/chat/stream", chatStreamHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-service" });
});

const PORT = Number(aiServiceEnv.PORT) || 4003;
app.listen(PORT, () => {
  console.log(`ai-service running on port ${PORT}`);
});

export default app;
