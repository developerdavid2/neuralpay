import { userServiceEnv } from "@neuralpay/env/user-service";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const PORT = Number(userServiceEnv.PORT) || 4001;
const app: Express = express();

app.use(helmet());
app.use(cors({ origin: [userServiceEnv.CORS_ORIGIN], credentials: true }));
app.use(morgan("dev"));

// Better Auth owns ALL auth routes on this service
app.use("/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service", port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 user-service running on http://localhost:${PORT}`);
});

export { app };
