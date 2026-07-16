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

// Must be after body-parser middleware
app.post("/chat/stream", chatStreamHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 ai-service running on http://localhost:${PORT}`);
    console.log(`   Chat stream at http://localhost:${PORT}/chat/stream`);
  });
}

export default app;
