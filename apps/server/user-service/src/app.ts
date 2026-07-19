import "dotenv/config";

import * as trpcExpress from "@trpc/server/adapters/express";
import { createExpressApp } from "@neuralpay/config/express-config";
import { usersRouter } from "./routers";
import { userServiceEnv } from "@neuralpay/env/user-service";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { createContext } from "./trpc/context";
import { mountUploadThing } from "@neuralpay/file-upload/express";
import { userFileRouter } from "./lib/uploadthing";

const PORT = Number(userServiceEnv.PORT) || 4001;
const app = createExpressApp({
  serviceName: "user-service",
  port: PORT,
  beforeBodyParser: (a) => {
    a.use("/api/auth", toNodeHandler(auth));
    mountUploadThing(a, { router: userFileRouter });
  },
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: usersRouter,
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
});

export default app;
