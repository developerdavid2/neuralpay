import { router } from "@neuralpay/config/trpc";
import { coachRouter } from "./coach.router";
import { insightsRouter } from "./insights.router";

export const aiRouter = router({
  insights: insightsRouter,
  coach: coachRouter,
});

export type AIRouter = typeof aiRouter;
