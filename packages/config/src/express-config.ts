import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

interface AppConfig {
  serviceName: string;
  port: number;
  allowedOrigins?: string[] | string;
}

function parseOrigins(origins?: string[] | string): string[] {
  if (!origins) return ["http://localhost:3001"];
  if (Array.isArray(origins)) {
    // Flatten in case someone passes ["a,b"]
    return origins.flatMap((o) => o.split(",").map((s) => s.trim()));
  }
  return origins.split(",").map((s) => s.trim());
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
      origin: parseOrigins(config.allowedOrigins),
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
