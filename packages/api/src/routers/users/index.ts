import { router } from "../../trpc";
import { profileRouter } from "./profile.router";

export const usersRouter = router({
  profile: profileRouter,
});
