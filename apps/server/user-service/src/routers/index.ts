import { router } from "@neuralpay/config/trpc";
import { profileRouter } from "./profile.router";
import { locationRouter } from "./location.router";
import { securityRouter } from "./security.router";

export const usersRouter = router({
  profile: profileRouter,
  location: locationRouter,
  security: securityRouter,
});

export type UserRouter = typeof usersRouter;
