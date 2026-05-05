import { userServiceEnv } from "@neuralpay/env/user-service";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import * as trpcExpress from "@trpc/server/adapters/express";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createContext } from "@neuralpay/api/context";
import { appRouter } from "./routers";

const PORT = Number(userServiceEnv.PORT) || 4001;
const app: Express = express();

app.use(helmet());
app.use(cors({ origin: [userServiceEnv.CORS_ORIGIN], credentials: true }));
app.use(morgan("dev"));

// Better Auth — all auth HTTP routes
app.use("/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "user-service", port: PORT }),
);

// tRPC — gateway proxies /v1/trpc/users.* → here at /trpc
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC user-service] error on /${path}:`, error.message);
      }
    },
  }),
);

app.listen(PORT, () => {
  console.log(`🚀 user-service running on http://localhost:${PORT}`);
  console.log(`   tRPC at http://localhost:${PORT}/trpc`);
});

export { app };
