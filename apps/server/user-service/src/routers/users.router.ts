import {
  Router,
  type Router as ExpressRouter,
  type Request,
  type Response,
} from "express";
import type { AuthenticatedRequest } from "../types";
import { requireAuth } from "../middleware/auth.middleware";
import { UsersService } from "../services/users.service";

const router: ExpressRouter = Router();

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const result = await UsersService.getById(user.id);
  res.json(result);
});

router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const result = await UsersService.update(user.id, req.body);
  res.json(result);
});

export { router as usersRouter };
