import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { aiRouter } from "./routers";
import { createContext } from "@neuralpay/config/express-context";
import { aiServiceEnv } from "@neuralpay/env/ai-service";

const PORT = Number(aiServiceEnv.PORT) || 4003;
const app = createExpressApp({ serviceName: "ai-service", port: PORT });

// tRPC — gateway proxies /v1/trpc/users.* → here at /trpc
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

app.listen(PORT, () => {
  console.log(`🚀 ai-service running on http://localhost:${PORT}`);
  console.log(`   tRPC at http://localhost:${PORT}/trpc`);
});
