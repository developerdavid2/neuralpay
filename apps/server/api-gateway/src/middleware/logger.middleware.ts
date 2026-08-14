import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  logger.info(`→ ${req.method} ${req.url}`);
  if (Object.keys(req.body ?? {}).length) {
    logger.debug(`Body: ${JSON.stringify(req.body)}`);
  }
  next();
}
