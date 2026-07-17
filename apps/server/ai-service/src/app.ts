import type { Express } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { aiRouter } from "./routers";
import { aiServiceEnv } from "@neuralpay/env/ai-service";
import { createContext } from "./trpc/context";
import { chatStreamHandler } from "./routers/chat-stream.router";

let app: Express;
const PORT = Number(aiServiceEnv.PORT) || 4003;
try {
  app = createExpressApp({ serviceName: "ai-service", port: PORT });
} catch (error) {
  console.error("[v0] Failed to create Express app:", error);
  throw error;
}

try {
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
} catch (error) {
  console.error("[v0] Failed to add tRPC middleware:", error);
}

try {
  app.post("/chat/stream", chatStreamHandler);
} catch (error) {
  console.error("[v0] Failed to add chat stream route:", error);
}

app.listen(PORT, () => {
  console.log(`ai-service listening on port ${PORT}`);
});
// Export for Vercel serverless functions
export default app;
