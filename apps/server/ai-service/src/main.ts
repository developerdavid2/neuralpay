import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { aiRouter } from "./routers";
import { aiServiceEnv } from "@neuralpay/env/ai-service";
import { createContext } from "./trpc/context";
import { chatStreamHandler } from "./routers/chat-stream.router";

console.log("[v0] ai-service starting, NODE_ENV:", process.env.NODE_ENV);

let app;
try {
  const PORT = Number(aiServiceEnv.PORT) || 4003;
  app = createExpressApp({ serviceName: "ai-service", port: PORT });
  console.log("[v0] Express app created successfully");
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
  console.log("[v0] tRPC middleware added");
} catch (error) {
  console.error("[v0] Failed to add tRPC middleware:", error);
}

try {
  app.post("/chat/stream", chatStreamHandler);
  console.log("[v0] Chat stream route added");
} catch (error) {
  console.error("[v0] Failed to add chat stream route:", error);
}

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("[v0] Health check requested");
  res.json({ status: "ok", service: "ai-service", timestamp: new Date().toISOString() });
});

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
