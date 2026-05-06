import { router } from "@neuralpay/config/trpc";
import { insightsRouter } from "./insights.router";
import { coachRouter } from "./coach.router";

export const aiRouter = router({
  insights: insightsRouter,
  coach: coachRouter,
});

export type AIRouter = typeof aiRouter;
