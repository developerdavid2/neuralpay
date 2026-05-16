import type { AppRouter } from "@neuralpay/api-gateway/router";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type TransactionsOutputs =
  RouterOutputs["payments"]["transactions"]["list"];
export type Transaction = TransactionsOutputs["items"][number];
