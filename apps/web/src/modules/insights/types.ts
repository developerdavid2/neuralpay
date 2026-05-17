import type { AppRouter } from "@neuralpay/api-gateway/router";
import type { inferProcedureInput, inferRouterOutputs } from "@trpc/server";

// Insights Procedure Input
export type InsightsListInput = inferProcedureInput<
  AppRouter["ai"]["insights"]["list"]
>;

// Insight Router Outputs
type RouterOutputs = inferRouterOutputs<AppRouter>;
export type InsightsOutputs = RouterOutputs["ai"]["insights"]["list"];
export type Insight = InsightsOutputs[number];
