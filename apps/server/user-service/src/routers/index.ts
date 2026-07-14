import { router } from "@neuralpay/config/trpc";
import { profileRouter } from "./profile.router";
import { locationRouter } from "./location.router";
import { securityRouter } from "./security.router";
import type { userFileRouter } from "../lib/uploadthing";

export const usersRouter = router({
  profile: profileRouter,
  location: locationRouter,
  security: securityRouter,
});

export type UserRouter = typeof usersRouter;
export type UserFileRouter = typeof userFileRouter;
