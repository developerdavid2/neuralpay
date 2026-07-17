import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { aiRouter } from "./routers";
import { aiServiceEnv } from "@neuralpay/env/ai-service";
import { createContext } from "./trpc/context";
import { chatStreamHandler } from "./routers/chat-stream.router";

const PORT = Number(aiServiceEnv.PORT) || 4003;
const app = createExpressApp({ serviceName: "ai-service", port: PORT });

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

// Start server only in development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`ai-service running on http://localhost:${PORT}`);
  });
} else {
  // Ensure app listens in production for local testing
  app.listen(PORT, () => {
    console.log(`[Vercel] ai-service listening on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;
