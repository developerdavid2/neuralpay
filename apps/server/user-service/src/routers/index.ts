import { router } from "@neuralpay/config/trpc";
import { profileRouter } from "./profile.router";

export const usersRouter = router({
  profile: profileRouter,
});

export type UserRouter = typeof usersRouter;
