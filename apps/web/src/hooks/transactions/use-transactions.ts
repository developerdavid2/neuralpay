import { TRANSACTIONS_LIMIT } from "@/modules/dashboard/constants";

import { useTRPC } from "@/trpc/trpc-client";
import type { TransactionsFilterInput } from "@neuralpay/types";
import {
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

// LIST / PAGINATION

export function useTransactionsList(filters: TransactionsFilterInput) {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.payments.transactions.list.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );

  return {
    ...query,
    isLoading: query.isPending,
  };
}

// TRANSACTIONS (for dashboard)
//RECENT
export function useRecentTransactions(limit = TRANSACTIONS_LIMIT) {
  const trpc = useTRPC();
  const { data: recentTransactions } = useSuspenseQuery(
    trpc.payments.transactions.recent.queryOptions({ limit }),
  );

  return { recentTransactions };
}
//SPENDING OVERVIEW
export function useSpendingOverview(params: {
  period: "7d" | "30d" | "90d" | "custom";
  from?: string;
  to?: string;
}) {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.payments.transactions.spendingOverview.queryOptions(params),
  );
}

//TOP MONTHLY CATEGORIES
export function useTopCategories(params?: {
  month?: number;
  year?: number;
  limit?: number;
}) {
  const trpc = useTRPC();
  const now = new Date();

  return useSuspenseQuery(
    trpc.payments.transactions.topCategories.queryOptions({
      month: params?.month ?? now.getMonth() + 1,
      year: params?.year ?? now.getFullYear(),
      limit: params?.limit ?? 5,
    }),
  );
}

// TRANSACTION DETAILS BY ID
export function useTransactionDetail(transactionId: string) {
  const trpc = useTRPC();
  const {
    data: transaction,
    isPending,
    isError,
  } = useQuery({
    ...trpc.payments.transactions.getById.queryOptions({ id: transactionId }),
    enabled: !!transactionId,
  });

  return {
    transaction: transaction ?? null,
    isLoading: isPending,
    isError,
  };
}

//AI INSIGHT
// export function useTransactionInsight(transactionId: string | null) {
//   const trpc = useTRPC();
//   const {
//     data: insight,
//     isPending,
//     isError,
//   } = useQuery({
//     ...trpc.ai.insights.getInsightById.queryOptions(
//       { transactionId: transactionId! },
//       { enabled: !!transactionId },
//     ),
//     enabled: !!transactionId,
//   });

//   return {
//     insight: insight ?? null,
//     isLoading: isPending,
//     isError,
//   };
// }
