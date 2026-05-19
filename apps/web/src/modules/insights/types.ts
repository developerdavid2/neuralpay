import type { AppRouter } from "@neuralpay/api-gateway/router";
import type { inferProcedureInput, inferRouterOutputs } from "@trpc/server";

type RawInsightsInput = inferProcedureInput<
  AppRouter["ai"]["insights"]["list"]
>;

export type InsightsListInput = Exclude<RawInsightsInput, void | undefined>;

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type InsightsOutputs = RouterOutputs["ai"]["insights"]["list"];

export type Insight = InsightsOutputs[number];
