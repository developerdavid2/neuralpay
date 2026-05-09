import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

interface AppConfig {
  serviceName: string;
  port: number;
  allowedOrigins?: string[];
}

export function createExpressApp(
  config: AppConfig & {
    beforeBodyParser?: (app: Express) => void;
  },
): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.allowedOrigins ?? ["http://localhost:3001"],
      credentials: true,
    }),
  );
  config.beforeBodyParser?.(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: config.serviceName,
      port: config.port,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return app;
}
