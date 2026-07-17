import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { aiRouter } from "../apps/server/ai-service/src/routers";
import { aiServiceEnv } from "@neuralpay/env/ai-service";
import { createContext } from "../apps/server/ai-service/src/trpc/context";
import { chatStreamHandler } from "../apps/server/ai-service/src/routers/chat-stream.router";

const app = createExpressApp({ serviceName: "ai-service", port: 4003 });

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: aiRouter,
    createContext,
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC ai-service] error on /${path}:`, error.message);
      }
    },
  }),
);

app.post("/chat/stream", chatStreamHandler);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ai-service", timestamp: new Date().toISOString() });
});

export default app;
