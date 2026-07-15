import { router } from "@neuralpay/config/trpc";
import { profileRouter } from "./profile.router";
import { locationRouter } from "./location.router";
import { securityRouter } from "./security.router";
import type { userFileRouter } from "../lib/uploadthing";
import { authRouter } from "./auth.router";

export const usersRouter = router({
  auth: authRouter,
  security: securityRouter,
  profile: profileRouter,
  location: locationRouter,
});

export type UserRouter = typeof usersRouter;
export type UserFileRouter = typeof userFileRouter;
